const express = require("express");
const pool = require("../db/pool");
const { sendSuccess, sendError } = require("../utils/response");
const { getOptionsByProductIds, formatProduct } = require('../utils/catalog');
const router = express.Router();

// Helper: ambil optionGroups & values untuk daftar productId sekaligus (hindari N+1 query)


// GET /api/v1/store
router.get("/store", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT business_name, beverage_brand_name, description, address,
              operating_hours, delivery_enabled, pickup_enabled
       FROM business_settings
       LIMIT 1`,
    );

    if (rows.length === 0) {
      return sendError(res, "Store settings not found", 404);
    }

    const s = rows[0];
    return sendSuccess(res, {
      businessName: s.business_name,
      beverageBrandName: s.beverage_brand_name,
      description: s.description,
      address: s.address,
      operatingHours: s.operating_hours,
      deliveryEnabled: s.delivery_enabled,
      pickupEnabled: s.pickup_enabled,
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/categories
router.get("/categories", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, slug, description, display_order
       FROM categories
       WHERE is_active = TRUE
       ORDER BY display_order ASC, name ASC`,
    );

    const categories = rows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      displayOrder: c.display_order,
    }));

    return sendSuccess(res, categories);
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/products
router.get("/products", async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 20),
    );
    const offset = (page - 1) * limit;

    const conditions = ["c.is_active = TRUE"];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`c.slug = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`p.name ILIKE $${params.length}`);
    }

    params.push(limit, offset);
    const limitIdx = params.length - 1;
    const offsetIdx = params.length;

    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.image_url, p.is_available,
              c.id AS category_id, c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY c.display_order ASC, p.display_order ASC, p.name ASC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );

    const optionsMap = await getOptionsByProductIds(rows.map((r) => r.id));
    const products = rows.map((row) =>
      formatProduct(row, optionsMap[row.id] || []),
    );

    return sendSuccess(res, products);
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/products/:slug
router.get("/products/:slug", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.image_url, p.is_available,
              c.id AS category_id, c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.slug = $1 AND c.is_active = TRUE
       LIMIT 1`,
      [req.params.slug],
    );

    if (rows.length === 0) {
      return sendError(res, "Product not found", 404);
    }

    const row = rows[0];
    const optionsMap = await getOptionsByProductIds([row.id]);
    return sendSuccess(res, formatProduct(row, optionsMap[row.id] || []));
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
