const path = require("path");
const { createRequire } = require("module");
const serverRequire = createRequire(
  path.resolve(__dirname, "../../apps/server/package.json"),
);

serverRequire("dotenv").config({
  path: path.resolve(__dirname, "../../apps/server/.env"),
});
const { Pool } = serverRequire("pg");
const bcrypt = serverRequire("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Akun seller awal (dev only - ganti di production)
    const passwordHash = await bcrypt.hash("seller123", 10);
    await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'seller')
       ON CONFLICT (email) DO NOTHING`,
      ["Owner YAYA FOOD", "seller@yayafood.local", passwordHash],
    );

    // 2. Pengaturan toko awal (placeholder dev, bisa diubah dari Seller Dashboard)
    await client.query(
      `INSERT INTO business_settings (
        business_name, beverage_brand_name, description, whatsapp_number,
        delivery_enabled, pickup_enabled, delivery_fee
      )
      VALUES ($1, $2, $3, $4, TRUE, TRUE, 0)
      ON CONFLICT DO NOTHING`,
      [
        "YAYA FOOD",
        "Terracha",
        "Masakan rumahan dan minuman segar Terracha.",
        "628000000000", // placeholder dev, ganti di Seller Dashboard
      ],
    );

    // 3. Kategori awal
    const categoriesData = [
      { name: "Nasi Goreng & Kwetiau", slug: "nasi-goreng-kwetiau", order: 1 },
      { name: "Menu Ayam", slug: "menu-ayam", order: 2 },
      { name: "Terracha Coffee", slug: "terracha-coffee", order: 3 },
      { name: "Terracha Matcha", slug: "terracha-matcha", order: 4 },
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      const res = await client.query(
        `INSERT INTO categories (name, slug, display_order)
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [cat.name, cat.slug, cat.order],
      );
      categoryMap[cat.slug] = res.rows[0].id;
    }

    // 4. Produk awal (harga integer Rupiah)
    const productsData = [
      {
        cat: "nasi-goreng-kwetiau",
        name: "Nasi Goreng Biasa",
        slug: "nasi-goreng-biasa",
        price: 10000,
        desc: null,
        order: 1,
      },
      {
        cat: "nasi-goreng-kwetiau",
        name: "Nasi Goreng Telur",
        slug: "nasi-goreng-telur",
        price: 12000,
        desc: null,
        order: 2,
      },
      {
        cat: "nasi-goreng-kwetiau",
        name: "Kwetiau Goreng/Rebus",
        slug: "kwetiau-goreng-rebus",
        price: 10000,
        desc: "Pilihan penyajian Goreng atau Rebus",
        order: 3,
      },
      {
        cat: "menu-ayam",
        name: "Nasi Ayam Geprek",
        slug: "nasi-ayam-geprek",
        price: 13000,
        desc: "Pilihan level pedas sesuai selera",
        order: 1,
      },
      {
        cat: "menu-ayam",
        name: "Nasi Ayam Bakar",
        slug: "nasi-ayam-bakar",
        price: 13000,
        desc: null,
        order: 2,
      },
      {
        cat: "menu-ayam",
        name: "Nasi Ayam Goreng Rempah",
        slug: "nasi-ayam-goreng-rempah",
        price: 13000,
        desc: null,
        order: 3,
      },
      {
        cat: "terracha-coffee",
        name: "Americano",
        slug: "americano",
        price: 12000,
        desc: "250 ml",
        order: 1,
      },
      {
        cat: "terracha-coffee",
        name: "Aren Latte",
        slug: "aren-latte",
        price: 15000,
        desc: "250 ml",
        order: 2,
      },
      {
        cat: "terracha-coffee",
        name: "Cappuccino",
        slug: "cappuccino",
        price: 15000,
        desc: "250 ml",
        order: 3,
      },
      {
        cat: "terracha-matcha",
        name: "Matcha Latte",
        slug: "matcha-latte",
        price: 15000,
        desc: "250 ml",
        order: 1,
      },
      {
        cat: "terracha-matcha",
        name: "Dirty Matcha",
        slug: "dirty-matcha",
        price: 17000,
        desc: "250 ml",
        order: 2,
      },
    ];

    const productMap = {};
    for (const p of productsData) {
      const res = await client.query(
        `INSERT INTO products (category_id, name, slug, description, price, display_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price
         RETURNING id`,
        [categoryMap[p.cat], p.name, p.slug, p.desc, p.price, p.order],
      );
      productMap[p.slug] = res.rows[0].id;
    }

    // 5. Opsi produk (hanya insert jika produk belum punya option group)
    async function seedOptions(productSlug, groupName, values) {
      const productId = productMap[productSlug];
      const existing = await client.query(
        "SELECT id FROM product_option_groups WHERE product_id = $1",
        [productId],
      );
      if (existing.rows.length > 0) return;

      const groupRes = await client.query(
        `INSERT INTO product_option_groups (product_id, name, is_required, display_order)
         VALUES ($1, $2, TRUE, 1) RETURNING id`,
        [productId, groupName],
      );
      const groupId = groupRes.rows[0].id;

      for (let i = 0; i < values.length; i++) {
        await client.query(
          `INSERT INTO product_option_values (option_group_id, name, display_order)
           VALUES ($1, $2, $3)`,
          [groupId, values[i], i + 1],
        );
      }
    }

    await seedOptions("nasi-ayam-geprek", "Level Pedas", [
      "Tidak Pedas",
      "Pedas Biasa",
      "Pedas Banget",
    ]);
    await seedOptions("kwetiau-goreng-rebus", "Jenis Penyajian", [
      "Goreng",
      "Rebus",
    ]);

    await client.query("COMMIT");
    console.log("Seed berhasil!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed gagal:", err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
