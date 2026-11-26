# YAYA FOOD — Restaurant Website & Seller Dashboard

Aplikasi web fullstack untuk UMKM kuliner **YAYA FOOD** beserta brand minumannya **Terracha**.  
Pelanggan dapat melihat menu, memilih variasi produk (level pedas, jenis penyajian), menggabungkan makanan dan minuman dalam satu keranjang, lalu melanjutkan pemesanan melalui **WhatsApp Click-to-Chat** tanpa perlu membuat akun.

## Tech Stack

- **Customer & Seller Frontend:** React (Vite) + Tailwind CSS
- **Backend API:** Node.js + Express.js (REST `/api/v1`)
- **Database:** PostgreSQL
- **Security & Validation:** `bcryptjs`, `jsonwebtoken` (`httpOnly` cookies), `helmet`, `cors`, `express-rate-limit`, `zod`

## Struktur Proyek

```text
├── apps/
│   ├── customer/   # Website publik untuk pelanggan
│   ├── seller/     # Dashboard admin untuk penjual
│   └── server/     # Backend REST API (Express + PostgreSQL)
└── database/
    ├── migrations/ # Skema tabel PostgreSQL
    └── seeds/      # Data awal menu, kategori, dan akun seller dev
```

## Fitur Utama

- **Public Catalog:** Daftar kategori, pencarian menu, filter kategori, dan opsi variasi produk.
- **Cart & Checkout:** Keranjang gabungan makanan + minuman, validasi opsi wajib & perhitungan total harga di backend, serta penyimpanan snapshot order.
- **WhatsApp Handoff:** Membuat tautan `wa.me` berisi ringkasan pesanan untuk dikirim manual oleh pelanggan.
- **Seller Dashboard:** Autentikasi seller berbasis `httpOnly` cookie, manajemen kategori, produk, opsi produk, dan pengaturan toko.

## Menjalankan Secara Lokal

1. Pastikan PostgreSQL berjalan dan buat database `yaya_food_db`.
2. Jalankan migrasi `database/migrations/001_initial_schema.sql`.
3. Konfigurasi `apps/server/.env` (`PORT`, `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGINS`).
4. Install dependencies & isi data awal:
   ```bash
   npm install
   node database/seeds/seed.js
   ```
5. Jalankan backend:
   ```bash
   npm --workspace=server run dev
   ```