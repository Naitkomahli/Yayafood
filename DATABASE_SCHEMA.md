# DATABASE_SCHEMA.md — YAYA FOOD

## 1. Database overview

- Database: PostgreSQL
- Database name: `yaya_food_db`
- Primary keys: UUID
- Currency: integer IDR values
- Customers do not need accounts.

The schema supports catalog management, product options, seller authentication, business settings, and persisted customer orders.

## 2. Tables

### 2.1 users

Seller/admin accounts.

| Column | Type | Constraint |
|---|---|---|
| id | UUID | Primary key |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | TEXT | NOT NULL |
| role | VARCHAR(20) | NOT NULL, default `seller` |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

### 2.2 categories

| Column | Type | Constraint |
|---|---|---|
| id | UUID | Primary key |
| name | VARCHAR(100) | NOT NULL |
| slug | VARCHAR(120) | UNIQUE, NOT NULL |
| description | TEXT | NULL |
| display_order | INTEGER | NOT NULL, default 0 |
| is_active | BOOLEAN | NOT NULL, default TRUE |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

Initial categories:
- Nasi Goreng & Kwetiau
- Menu Ayam
- Terracha Coffee
- Terracha Matcha

### 2.3 products

| Column | Type | Constraint |
|---|---|---|
| id | UUID | Primary key |
| category_id | UUID | FK to categories.id |
| name | VARCHAR(150) | NOT NULL |
| slug | VARCHAR(170) | UNIQUE, NOT NULL |
| description | TEXT | NULL |
| price | BIGINT | NOT NULL, >= 0 |
| image_url | TEXT | NULL |
| is_available | BOOLEAN | NOT NULL, default TRUE |
| display_order | INTEGER | NOT NULL, default 0 |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

Store Rupiah as integer values, never floating-point currency.

### 2.4 product_option_groups

Variation groups belonging to a product.

| Column | Type | Constraint |
|---|---|---|
| id | UUID | Primary key |
| product_id | UUID | FK to products.id |
| name | VARCHAR(100) | NOT NULL |
| is_required | BOOLEAN | NOT NULL, default TRUE |
| display_order | INTEGER | NOT NULL, default 0 |

Examples: Level Pedas, Jenis Penyajian.

### 2.5 product_option_values

Selectable values within an option group.

| Column | Type | Constraint |
|---|---|---|
| id | UUID | Primary key |
| option_group_id | UUID | FK to product_option_groups.id |
| name | VARCHAR(100) | NOT NULL |
| additional_price | BIGINT | NOT NULL, default 0 |
| is_available | BOOLEAN | NOT NULL, default TRUE |
| display_order | INTEGER | NOT NULL, default 0 |

Initial values:
- Nasi Ayam Geprek: Tidak Pedas, Pedas Biasa, Pedas Banget.
- Kwetiau: Goreng, Rebus.

### 2.6 business_settings

Single-store business configuration.

| Column | Type | Constraint |
|---|---|---|
| id | UUID | Primary key |
| business_name | VARCHAR(150) | NOT NULL |
| beverage_brand_name | VARCHAR(150) | NULL |
| description | TEXT | NULL |
| whatsapp_number | VARCHAR(30) | NOT NULL |
| address | TEXT | NULL |
| operating_hours | JSONB | NULL |
| delivery_enabled | BOOLEAN | NOT NULL, default TRUE |
| pickup_enabled | BOOLEAN | NOT NULL, default TRUE |
| delivery_fee | BIGINT | NOT NULL, default 0 |
| updated_at | TIMESTAMPTZ | NOT NULL |

Only one active settings record is expected for the initial single-store application. Enforce this invariant in the application and, where appropriate, with a database constraint.

### 2.7 orders

| Column | Type | Constraint |
|---|---|---|
| id | UUID | Primary key |
| order_number | VARCHAR(40) | UNIQUE, NOT NULL |
| customer_name | VARCHAR(120) | NOT NULL |
| customer_phone | VARCHAR(30) | NOT NULL |
| fulfillment_method | VARCHAR(20) | NOT NULL |
| delivery_address | TEXT | NULL |
| notes | TEXT | NULL |
| subtotal | BIGINT | NOT NULL, >= 0 |
| delivery_fee | BIGINT | NOT NULL, default 0 |
| total | BIGINT | NOT NULL, >= 0 |
| status | VARCHAR(30) | NOT NULL, default `created` |
| whatsapp_handoff_at | TIMESTAMPTZ | NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

Fulfillment values: `delivery`, `pickup`.

Initial statuses: `created`, `accepted`, `preparing`, `completed`, `cancelled`.

`whatsapp_handoff_at` records that the application initiated/generated the handoff; it does not prove that the customer sent the message.

### 2.8 order_items

| Column | Type | Constraint |
|---|---|---|
| id | UUID | Primary key |
| order_id | UUID | FK to orders.id |
| product_id | UUID | FK to products.id, nullable if product is later removed |
| product_name | VARCHAR(150) | NOT NULL |
| unit_price | BIGINT | NOT NULL, >= 0 |
| quantity | INTEGER | NOT NULL, > 0 |
| subtotal | BIGINT | NOT NULL, >= 0 |

Product name and price are snapshots so historical orders remain accurate after catalog changes.

### 2.9 order_item_options

| Column | Type | Constraint |
|---|---|---|
| id | UUID | Primary key |
| order_item_id | UUID | FK to order_items.id |
| option_group_name | VARCHAR(100) | NOT NULL |
| option_value_name | VARCHAR(100) | NOT NULL |
| additional_price | BIGINT | NOT NULL, default 0 |

Store option snapshots rather than relying only on current catalog option records.

## 3. Relationships

- One category has many products.
- One product belongs to one category.
- One product has many option groups.
- One option group has many option values.
- One order has many order items.
- One order item can have multiple selected options.
- Seller accounts manage the store.
- Business settings contain the WhatsApp destination and fulfillment configuration.

## 4. Business rules and integrity

1. Product and option prices must be non-negative integers.
2. Quantity must be a positive integer.
3. Unavailable products cannot be ordered.
4. Required option groups must have valid selections.
5. Selected options must belong to the selected product.
6. The backend recalculates every price and total.
7. Historical order details must not change after product updates.
8. Delivery address is required only for delivery.
9. Product deletion must not erase historical order details.
10. Order and order-item creation must be atomic.

## 5. Recommended indexes

- `categories(slug)`
- `products(slug)`
- `products(category_id)`
- `products(is_available)`
- `product_option_groups(product_id)`
- `product_option_values(option_group_id)`
- `orders(order_number)`
- `orders(created_at)`
- `orders(status)`
- `order_items(order_id)`

Use foreign keys, unique constraints, check constraints, and transactions. Prefer deactivation/soft deletion for catalog records referenced by historical orders.
