const express = require('express');
const { z } = require('zod');
const pool = require('../db/pool');
const { sendSuccess, sendError } = require('../utils/response');
const { requireSeller } = require('../middleware/auth.middleware');
const { getOptionsByProductIds, formatProduct } = require('../utils/catalog');

const router = express.Router();
router.use(requireSeller);

const uuidSchema = z.string().uuid();

function parseBody(schema, body, res) {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    sendError(res, 'Validation failed', 422, errors);
    return null;
  }
  return parsed.data;
}

function checkUuid(id, res) {
  if (!uuidSchema.safeParse(id).success) {
    sendError(res, 'Invalid ID format', 400);
    return false;
  }
  return true;
}

// ==================== CATEGORIES ====================

const categorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(120),
  description: z.string().nullable().optional(),
  displayOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

router.get('/categories', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, slug, description, display_order, is_active, created_at, updated_at
       FROM categories
       ORDER BY display_order ASC, name ASC`
    );
    return sendSuccess(
      res,
      rows.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        displayOrder: c.display_order,
        isActive: c.is_active,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }))
    );
  } catch (err) {
    return next(err);
  }
});

router.post('/categories', async (req, res, next) => {
  try {
    const data = parseBody(categorySchema, req.body, res);
    if (!data) return;

    const { rows } = await pool.query(
      `INSERT INTO categories (name, slug, description, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, slug, description, display_order, is_active`,
      [data.name, data.slug, data.description ?? null, data.displayOrder, data.isActive]
    );
    const c = rows[0];
    return sendSuccess(
      res,
      { id: c.id, name: c.name, slug: c.slug, description: c.description, displayOrder: c.display_order, isActive: c.is_active },
      'Category created',
      201
    );
  } catch (err) {
    if (err.code === '23505') return sendError(res, 'Category slug already exists', 409);
    return next(err);
  }
});

router.put('/categories/:id', async (req, res, next) => {
  try {
    if (!checkUuid(req.params.id, res)) return;
    const data = parseBody(categorySchema, req.body, res);
    if (!data) return;

    const { rows } = await pool.query(
      `UPDATE categories
       SET name = $1, slug = $2, description = $3, display_order = $4, is_active = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING id, name, slug, description, display_order, is_active`,
      [data.name, data.slug, data.description ?? null, data.displayOrder, data.isActive, req.params.id]
    );
    if (rows.length === 0) return sendError(res, 'Category not found', 404);
    const c = rows[0];
    return sendSuccess(res, {
      id: c.id, name: c.name, slug: c.slug, description: c.description, displayOrder: c.display_order, isActive: c.is_active,
    }, 'Category updated');
  } catch (err) {
    if (err.code === '23505') return sendError(res, 'Category slug already exists', 409);
    return next(err);
  }
});

router.delete('/categories/:id', async (req, res, next) => {
  try {
    if (!checkUuid(req.params.id, res)) return;

    const prodCheck = await pool.query(
      'SELECT 1 FROM products WHERE category_id = $1 LIMIT 1',
      [req.params.id]
    );
    if (prodCheck.rows.length > 0) {
      return sendError(res, 'Cannot delete category that still contains products', 409);
    }

    const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return sendError(res, 'Category not found', 404);
    return sendSuccess(res, null, 'Category deleted');
  } catch (err) {
    return next(err);
  }
});

// ==================== PRODUCTS ====================

const productSchema = z.object({
  categoryId: z.string().uuid('Valid categoryId is required'),
  name: z.string().trim().min(1).max(150),
  slug: z.string().trim().min(1).max(170),
  description: z.string().nullable().optional(),
  price: z.number().int().min(0),
  imageUrl: z.string().nullable().optional(),
  isAvailable: z.boolean().optional().default(true),
  displayOrder: z.number().int().optional().default(0),
});

router.get('/products', async (req, res, next) => {
  try {
    const { category, search, availability } = req.query;
    const conditions = [];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`c.slug = $${params.length}`);
    }
    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`p.name ILIKE $${params.length}`);
    }
    if (availability === 'true' || availability === 'false') {
      params.push(availability === 'true');
      conditions.push(`p.is_available = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.image_url, p.is_available, p.display_order,
              c.id AS category_id, c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ${whereClause}
       ORDER BY c.display_order ASC, p.display_order ASC, p.name ASC`,
      params
    );

    const optionsMap = await getOptionsByProductIds(rows.map((r) => r.id));
    return sendSuccess(res, rows.map((r) => formatProduct(r, optionsMap[r.id] || [])));
  } catch (err) {
    return next(err);
  }
});

router.post('/products', async (req, res, next) => {
  try {
    const data = parseBody(productSchema, req.body, res);
    if (!data) return;

    const { rows } = await pool.query(
      `INSERT INTO products (category_id, name, slug, description, price, image_url, is_available, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        data.categoryId,
        data.name,
        data.slug,
        data.description ?? null,
        data.price,
        data.imageUrl ?? null,
        data.isAvailable,
        data.displayOrder,
      ]
    );
    return sendSuccess(res, { id: rows[0].id }, 'Product created', 201);
  } catch (err) {
    if (err.code === '23505') return sendError(res, 'Product slug already exists', 409);
    if (err.code === '23503') return sendError(res, 'Category not found', 404);
    return next(err);
  }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    if (!checkUuid(req.params.id, res)) return;
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.image_url, p.is_available, p.display_order,
              c.id AS category_id, c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1 LIMIT 1`,
      [req.params.id]
    );
    if (rows.length === 0) return sendError(res, 'Product not found', 404);
    const optionsMap = await getOptionsByProductIds([rows[0].id]);
    return sendSuccess(res, formatProduct(rows[0], optionsMap[rows[0].id] || []));
  } catch (err) {
    return next(err);
  }
});

router.put('/products/:id', async (req, res, next) => {
  try {
    if (!checkUuid(req.params.id, res)) return;
    const data = parseBody(productSchema, req.body, res);
    if (!data) return;

    const { rowCount } = await pool.query(
      `UPDATE products
       SET category_id = $1, name = $2, slug = $3, description = $4, price = $5,
           image_url = $6, is_available = $7, display_order = $8, updated_at = NOW()
       WHERE id = $9`,
      [
        data.categoryId,
        data.name,
        data.slug,
        data.description ?? null,
        data.price,
        data.imageUrl ?? null,
        data.isAvailable,
        data.displayOrder,
        req.params.id,
      ]
    );
    if (rowCount === 0) return sendError(res, 'Product not found', 404);
    return sendSuccess(res, { id: req.params.id }, 'Product updated');
  } catch (err) {
    if (err.code === '23505') return sendError(res, 'Product slug already exists', 409);
    if (err.code === '23503') return sendError(res, 'Category not found', 404);
    return next(err);
  }
});

// Soft-delete: nonaktifkan produk agar histori order lama tetap aman
router.delete('/products/:id', async (req, res, next) => {
  try {
    if (!checkUuid(req.params.id, res)) return;
    const { rowCount } = await pool.query(
      'UPDATE products SET is_available = FALSE, updated_at = NOW() WHERE id = $1',
      [req.params.id]
    );
    if (rowCount === 0) return sendError(res, 'Product not found', 404);
    return sendSuccess(res, null, 'Product deactivated');
  } catch (err) {
    return next(err);
  }
});

// ==================== PRODUCT OPTIONS ====================

const optionGroupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  isRequired: z.boolean().optional().default(true),
  displayOrder: z.number().int().optional().default(0),
});

const optionValueSchema = z.object({
  name: z.string().trim().min(1).max(100),
  additionalPrice: z.number().int().min(0).optional().default(0),
  isAvailable: z.boolean().optional().default(true),
  displayOrder: z.number().int().optional().default(0),
});

router.post('/products/:productId/option-groups', async (req, res, next) => {
  try {
    if (!checkUuid(req.params.productId, res)) return;
    const data = parseBody(optionGroupSchema, req.body, res);
    if (!data) return;

    const { rows } = await pool.query(
      `INSERT INTO product_option_groups (product_id, name, is_required, display_order)
       VALUES ($1, $2, $3, $4) RETURNING id, product_id, name, is_required, display_order`,
      [req.params.productId, data.name, data.isRequired, data.displayOrder]
    );
    return sendSuccess(res, rows[0], 'Option group created', 201);
  } catch (err) {
    if (err.code === '23503') return sendError(res, 'Product not found', 404);
    return next(err);
  }
});

router.put('/option-groups/:id', async (req, res, next) => {
  try {
    if (!checkUuid(req.params.id, res)) return;
    const data = parseBody(optionGroupSchema, req.body, res);
    if (!data) return;

    const { rows } = await pool.query(
      `UPDATE product_option_groups SET name = $1, is_required = $2, display_order = $3
       WHERE id = $4 RETURNING id, product_id, name, is_required, display_order`,
      [data.name, data.isRequired, data.displayOrder, req.params.id]
    );
    if (rows.length === 0) return sendError(res, 'Option group not found', 404);
    return sendSuccess(res, rows[0], 'Option group updated');
  } catch (err) {
    return next(err);
  }
});

router.delete('/option-groups/:id', async (req, res, next) => {
  try {
    if (!checkUuid(req.params.id, res)) return;
    const { rowCount } = await pool.query('DELETE FROM product_option_groups WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return sendError(res, 'Option group not found', 404);
    return sendSuccess(res, null, 'Option group deleted');
  } catch (err) {
    return next(err);
  }
});

router.post('/option-groups/:groupId/values', async (req, res, next) => {
  try {
    if (!checkUuid(req.params.groupId, res)) return;
    const data = parseBody(optionValueSchema, req.body, res);
    if (!data) return;

    const { rows } = await pool.query(
      `INSERT INTO product_option_values (option_group_id, name, additional_price, is_available, display_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, option_group_id, name, additional_price, is_available, display_order`,
      [req.params.groupId, data.name, data.additionalPrice, data.isAvailable, data.displayOrder]
    );
    const v = rows[0];
    return sendSuccess(res, { ...v, additional_price: Number(v.additional_price) }, 'Option value created', 201);
  } catch (err) {
    if (err.code === '23503') return sendError(res, 'Option group not found', 404);
    return next(err);
  }
});

router.put('/option-values/:id', async (req, res, next) => {
  try {
    if (!checkUuid(req.params.id, res)) return;
    const data = parseBody(optionValueSchema, req.body, res);
    if (!data) return;

    const { rows } = await pool.query(
      `UPDATE product_option_values
       SET name = $1, additional_price = $2, is_available = $3, display_order = $4
       WHERE id = $5
       RETURNING id, option_group_id, name, additional_price, is_available, display_order`,
      [data.name, data.additionalPrice, data.isAvailable, data.displayOrder, req.params.id]
    );
    if (rows.length === 0) return sendError(res, 'Option value not found', 404);
    const v = rows[0];
    return sendSuccess(res, { ...v, additional_price: Number(v.additional_price) }, 'Option value updated');
  } catch (err) {
    return next(err);
  }
});

router.delete('/option-values/:id', async (req, res, next) => {
  try {
    if (!checkUuid(req.params.id, res)) return;
    const { rowCount } = await pool.query('DELETE FROM product_option_values WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return sendError(res, 'Option value not found', 404);
    return sendSuccess(res, null, 'Option value deleted');
  } catch (err) {
    return next(err);
  }
});

// ==================== BUSINESS SETTINGS ====================

const settingsSchema = z.object({
  businessName: z.string().trim().min(1).max(150),
  beverageBrandName: z.string().max(150).nullable().optional(),
  description: z.string().nullable().optional(),
  whatsappNumber: z.string().trim().min(8).max(30),
  address: z.string().nullable().optional(),
  operatingHours: z.any().nullable().optional(),
  deliveryEnabled: z.boolean(),
  pickupEnabled: z.boolean(),
  deliveryFee: z.number().int().min(0),
});

router.get('/settings', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM business_settings LIMIT 1');
    if (rows.length === 0) return sendError(res, 'Store settings not found', 404);
    const s = rows[0];
    return sendSuccess(res, {
      id: s.id,
      businessName: s.business_name,
      beverageBrandName: s.beverage_brand_name,
      description: s.description,
      whatsappNumber: s.whatsapp_number,
      address: s.address,
      operatingHours: s.operating_hours,
      deliveryEnabled: s.delivery_enabled,
      pickupEnabled: s.pickup_enabled,
      deliveryFee: Number(s.delivery_fee),
      updatedAt: s.updated_at,
    });
  } catch (err) {
    return next(err);
  }
});

router.put('/settings', async (req, res, next) => {
  try {
    const data = parseBody(settingsSchema, req.body, res);
    if (!data) return;

    const { rows } = await pool.query(
      `UPDATE business_settings
       SET business_name = $1, beverage_brand_name = $2, description = $3,
           whatsapp_number = $4, address = $5, operating_hours = $6,
           delivery_enabled = $7, pickup_enabled = $8, delivery_fee = $9,
           updated_at = NOW()
       RETURNING *`,
      [
        data.businessName,
        data.beverageBrandName ?? null,
        data.description ?? null,
        data.whatsappNumber,
        data.address ?? null,
        data.operatingHours ? JSON.stringify(data.operatingHours) : null,
        data.deliveryEnabled,
        data.pickupEnabled,
        data.deliveryFee,
      ]
    );
    if (rows.length === 0) return sendError(res, 'Store settings not found', 404);
    const s = rows[0];
    return sendSuccess(res, {
      id: s.id,
      businessName: s.business_name,
      beverageBrandName: s.beverage_brand_name,
      description: s.description,
      whatsappNumber: s.whatsapp_number,
      address: s.address,
      operatingHours: s.operating_hours,
      deliveryEnabled: s.delivery_enabled,
      pickupEnabled: s.pickup_enabled,
      deliveryFee: Number(s.delivery_fee),
      updatedAt: s.updated_at,
    }, 'Settings updated');
  } catch (err) {
    return next(err);
  }
});

module.exports = router;