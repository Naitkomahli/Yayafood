const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const pool = require('../db/pool');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    sendError(res, 'Too many checkout attempts, please try again later', 429),
});

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1, 'Customer name is required').max(120),
    phone: z.string().trim().min(8, 'Valid WhatsApp number is required').max(30),
  }),
  fulfillment: z.object({
    method: z.enum(['delivery', 'pickup']),
    address: z.string().trim().nullable().optional(),
  }),
  notes: z.string().trim().max(500).nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid productId'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        optionValueIds: z.array(z.string().uuid()).optional().default([]),
      })
    )
    .min(1, 'At least one item is required'),
});

function normalizeWaNumber(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  return digits;
}

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `YAYA-${y}${m}${d}-${rand}`;
}

function formatRp(n) {
  return `Rp${Number(n).toLocaleString('id-ID')}`;
}

function buildWhatsappMessage({ orderNumber, customer, fulfillment, notes, items, subtotal, deliveryFee, total }) {
  const lines = [
    `*PESANAN BARU - ${orderNumber}*`,
    `Nama: ${customer.name}`,
    `No. WA: ${customer.phone}`,
    `Metode: ${fulfillment.method === 'delivery' ? 'Diantar' : 'Ambil sendiri'}`,
  ];
  if (fulfillment.method === 'delivery' && fulfillment.address) {
    lines.push(`Alamat: ${fulfillment.address}`);
  }
  if (notes) {
    lines.push(`Catatan: ${notes}`);
  }
  lines.push('', '*Detail Pesanan:*');
  for (const item of items) {
    const optStr = item.options.length > 0
      ? ` (${item.options.map((o) => o.optionValueName).join(', ')})`
      : '';
    lines.push(`- ${item.quantity}x ${item.productName}${optStr} @ ${formatRp(item.unitPrice)} = ${formatRp(item.subtotal)}`);
  }
  lines.push('', `Subtotal: ${formatRp(subtotal)}`);
  if (deliveryFee > 0) {
    lines.push(`Ongkir: ${formatRp(deliveryFee)}`);
  }
  lines.push(`*Total: ${formatRp(total)}*`);
  return lines.join('\n');
}

// POST /api/v1/orders/checkout
router.post('/checkout', checkoutLimiter, async (req, res, next) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return sendError(res, 'Validation failed', 422, errors);
  }

  const { customer, fulfillment, notes, items } = parsed.data;

  if (fulfillment.method === 'delivery' && !fulfillment.address) {
    return sendError(res, 'Validation failed', 422, [
      { field: 'fulfillment.address', message: 'Delivery address is required' },
    ]);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Ambil pengaturan toko
    const settingsRes = await client.query('SELECT * FROM business_settings LIMIT 1');
    if (settingsRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 'Store settings not found', 500);
    }
    const settings = settingsRes.rows[0];

    if (fulfillment.method === 'delivery' && !settings.delivery_enabled) {
      await client.query('ROLLBACK');
      return sendError(res, 'Delivery is currently unavailable', 400);
    }
    if (fulfillment.method === 'pickup' && !settings.pickup_enabled) {
      await client.query('ROLLBACK');
      return sendError(res, 'Pickup is currently unavailable', 400);
    }

    // 2. Ambil semua produk & opsi terkait dari database
    const productIds = [...new Set(items.map((i) => i.productId))];
    const prodRes = await client.query(
      `SELECT id, name, price, is_available FROM products WHERE id = ANY($1::uuid[])`,
      [productIds]
    );
    const productMap = new Map(prodRes.rows.map((p) => [p.id, p]));

    const groupRes = await client.query(
      `SELECT id, product_id, name, is_required FROM product_option_groups WHERE product_id = ANY($1::uuid[])`,
      [productIds]
    );
    const groupsByProduct = new Map();
    for (const g of groupRes.rows) {
      if (!groupsByProduct.has(g.product_id)) groupsByProduct.set(g.product_id, []);
      groupsByProduct.get(g.product_id).push(g);
    }

    const valRes = await client.query(
      `SELECT v.id, v.option_group_id, v.name, v.additional_price, v.is_available,
              g.product_id, g.name AS group_name
       FROM product_option_values v
       JOIN product_option_groups g ON g.id = v.option_group_id
       WHERE g.product_id = ANY($1::uuid[])`,
      [productIds]
    );
    const valueMap = new Map(valRes.rows.map((v) => [v.id, v]));

    // 3. Validasi tiap item & hitung harga di server
    let subtotal = 0;
    const preparedItems = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        await client.query('ROLLBACK');
        return sendError(res, 'One or more products were not found', 404);
      }
      if (!product.is_available) {
        await client.query('ROLLBACK');
        return sendError(res, `Product "${product.name}" is currently unavailable`, 400);
      }

      const selectedGroupIds = new Set();
      const chosenOptions = [];
      let optionExtra = 0;

      for (const valId of item.optionValueIds) {
        const val = valueMap.get(valId);
        if (!val || val.product_id !== product.id || !val.is_available) {
          await client.query('ROLLBACK');
          return sendError(res, `Invalid or unavailable option selected for "${product.name}"`, 400);
        }
        if (selectedGroupIds.has(val.option_group_id)) {
          await client.query('ROLLBACK');
          return sendError(res, `Duplicate option selected in "${val.group_name}"`, 400);
        }
        selectedGroupIds.add(val.option_group_id);
        const addPrice = Number(val.additional_price);
        optionExtra += addPrice;
        chosenOptions.push({
          optionGroupName: val.group_name,
          optionValueName: val.name,
          additionalPrice: addPrice,
        });
      }

      const requiredGroups = (groupsByProduct.get(product.id) || []).filter((g) => g.is_required);
      for (const reqGroup of requiredGroups) {
        if (!selectedGroupIds.has(reqGroup.id)) {
          await client.query('ROLLBACK');
          return sendError(res, `Required option "${reqGroup.name}" is missing for "${product.name}"`, 422);
        }
      }

      const unitPrice = Number(product.price) + optionExtra;
      const lineSubtotal = unitPrice * item.quantity;
      subtotal += lineSubtotal;

      preparedItems.push({
        productId: product.id,
        productName: product.name,
        unitPrice,
        quantity: item.quantity,
        subtotal: lineSubtotal,
        options: chosenOptions,
      });
    }

    const deliveryFee = fulfillment.method === 'delivery' ? Number(settings.delivery_fee) : 0;
    const total = subtotal + deliveryFee;
    const orderNumber = generateOrderNumber();

    // 4. Simpan ke orders, order_items, dan order_item_options
    const orderRes = await client.query(
      `INSERT INTO orders (
        order_number, customer_name, customer_phone, fulfillment_method,
        delivery_address, notes, subtotal, delivery_fee, total, status, whatsapp_handoff_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'created', NOW())
      RETURNING id`,
      [
        orderNumber,
        customer.name,
        customer.phone,
        fulfillment.method,
        fulfillment.method === 'delivery' ? fulfillment.address : null,
        notes ?? null,
        subtotal,
        deliveryFee,
        total,
      ]
    );
    const orderId = orderRes.rows[0].id;

    for (const item of preparedItems) {
      const itemRes = await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [orderId, item.productId, item.productName, item.unitPrice, item.quantity, item.subtotal]
      );
      const orderItemId = itemRes.rows[0].id;

      for (const opt of item.options) {
        await client.query(
          `INSERT INTO order_item_options (order_item_id, option_group_name, option_value_name, additional_price)
           VALUES ($1, $2, $3, $4)`,
          [orderItemId, opt.optionGroupName, opt.optionValueName, opt.additionalPrice]
        );
      }
    }

    await client.query('COMMIT');

    const waNumber = normalizeWaNumber(settings.whatsapp_number);
    const waText = buildWhatsappMessage({
      orderNumber,
      customer,
      fulfillment,
      notes,
      items: preparedItems,
      subtotal,
      deliveryFee,
      total,
    });
    const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

    return sendSuccess(
      res,
      {
        orderNumber,
        subtotal,
        deliveryFee,
        total,
        whatsappUrl,
      },
      'Order created successfully',
      201
    );
  } catch (err) {
    await client.query('ROLLBACK');
    return next(err);
  } finally {
    client.release();
  }
});

module.exports = router;