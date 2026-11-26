# PRD — YAYA FOOD Restaurant Website

**Version:** 0.3  
**Status:** Draft  
**Product type:** Restaurant website with WhatsApp ordering  
**Business:** YAYA FOOD  
**Beverage brand:** Terracha

## 1. Product vision

YAYA FOOD is a restaurant website where customers can browse food and beverage menus, choose product options, add items to a cart, complete a checkout form, and continue the order conversation with the seller through WhatsApp.

The website is a digital menu and ordering channel, not a marketplace or a complex online payment platform.

## 2. Business identity

- Business name: YAYA FOOD
- Beverage brand: Terracha
- Business type: UMKM Food & Beverage
- Store count: One
- Seller dashboard: One

Terracha is a beverage brand within YAYA FOOD, not a separate seller.

## 3. Initial menu

### Nasi Goreng & Kwetiau

| Product | Price |
|---|---:|
| Nasi Goreng Biasa | Rp10.000 |
| Nasi Goreng Telur | Rp12.000 |
| Kwetiau Goreng/Rebus | Rp10.000 |

Kwetiau has two preparation options: Goreng and Rebus.

### Menu Ayam

| Product | Price |
|---|---:|
| Nasi Ayam Geprek | Rp13.000 |
| Nasi Ayam Bakar | Rp13.000 |
| Nasi Ayam Goreng Rempah | Rp13.000 |

Nasi Ayam Geprek has three spice options:
- Tidak Pedas
- Pedas Biasa
- Pedas Banget

### Terracha Coffee

| Product | Price | Size |
|---|---:|---|
| Americano | Rp12.000 | 250 ml |
| Aren Latte | Rp15.000 | 250 ml |
| Cappuccino | Rp15.000 | 250 ml |

### Terracha Matcha

| Product | Price | Size |
|---|---:|---|
| Matcha Latte | Rp15.000 | 250 ml |
| Dirty Matcha | Rp17.000 | 250 ml |

Prices and products are initial data based on the supplied menu images and must remain editable by the seller.

## 4. Target users

### Customer
A customer who wants to view the menu and place an order without creating an account.

Needs:
- Browse categories and products.
- View product images, descriptions, and prices.
- Select available product options.
- Combine food and beverages in one cart.
- Submit contact and fulfillment details.
- Continue to WhatsApp with a prepared order summary.

### Seller
The business owner or authorized staff member.

Needs:
- Securely sign in.
- Manage products, categories, prices, images, and availability.
- Manage business details and WhatsApp destination.
- Maintain the catalog without editing source code.

## 5. Applications

### 5.1 Customer website
A single-page restaurant website with sections such as:
- Navigation
- Hero
- Menu categories
- Featured products
- Full menu
- About the business
- Contact and footer

Product detail, cart, and checkout can be implemented as modal, drawer, or dedicated route/state while preserving the single-page browsing experience.

### 5.2 Seller dashboard
A separate frontend application with:
- Login
- Overview
- Product management
- Category management
- Business settings

The seller dashboard uses the same backend and database as the customer website.

## 6. Customer features

### Browse menu
- View active categories and available products.
- Filter by category.
- View product image, name, description, and price.
- See unavailable products clearly.

### Product selection
- Select quantity.
- Select required options when applicable.
- Nasi Ayam Geprek: Tidak Pedas, Pedas Biasa, Pedas Banget.
- Kwetiau: Goreng, Rebus.

### Shopping cart
- Add food and drinks to one cart.
- Update quantities.
- Remove items.
- Review selected options.
- See subtotal and estimated delivery fee if configured.
- Continue to checkout.

### Checkout
Collect:
- Customer name.
- WhatsApp number.
- Fulfillment method: delivery or pickup.
- Delivery address when delivery is selected.
- Optional order notes.

The customer does not need to register or log in.

### WhatsApp handoff
1. Customer submits checkout.
2. Backend validates products, options, availability, and prices.
3. Backend stores the order and its item snapshots.
4. Backend generates a WhatsApp Click-to-Chat URL using the store's configured number.
5. Customer opens WhatsApp and reviews the prefilled message.
6. Customer presses Send manually.
7. Seller and customer continue confirmation in WhatsApp.

Opening WhatsApp does not prove that the message was sent, payment was made, or seller accepted the order.

## 7. Seller features

### Authentication
- Seller login and logout.
- Protected seller routes and API endpoints.

### Product management
- Create, edit, deactivate, and manage products.
- Set name, description, price, category, image, and availability.
- Manage product option groups and values.

### Category management
- Create, edit, reorder, and deactivate categories.

### Business settings
- Business name and description.
- Beverage brand name.
- WhatsApp number.
- Address and operating hours.
- Delivery and pickup availability.
- Delivery fee configuration, once business rules are confirmed.

## 8. Business rules

1. Customers can browse without login.
2. One cart can contain products from all categories.
3. The backend is the source of truth for prices and totals.
4. Unavailable products cannot be checked out.
5. Required options must be selected and validated.
6. Delivery requires an address; pickup does not.
7. Orders and order items are saved atomically.
8. Historical order names, prices, and options are stored as snapshots.
9. WhatsApp messages are not sent automatically by the website.
10. WhatsApp handoff is not equivalent to payment or order confirmation.

## 9. Technology stack

| Layer | Technology |
|---|---|
| Customer frontend | React |
| Seller frontend | React |
| Styling | Tailwind CSS |
| Backend | Node.js |
| API framework | Express.js |
| Database | PostgreSQL |
| API style | REST |
| WhatsApp | WhatsApp Click-to-Chat |

## 10. MVP scope

### Must have
- Responsive single-page customer website.
- Menu categories and product catalog.
- Product details and options.
- Cart with mixed food and beverage items.
- Checkout form.
- Backend price validation.
- Order persistence.
- WhatsApp Click-to-Chat handoff.
- Seller authentication.
- Product and category CRUD.
- Business settings.

### Future enhancements
- Payment gateway and QRIS.
- WhatsApp Business API automation.
- Customer accounts.
- Coupons and discounts.
- Inventory management.
- Sales analytics and reports.
- Order history and advanced order management.

## 11. Open business questions

These must not be invented by the implementation agent:
- Exact seller WhatsApp number.
- Exact business address and operating hours.
- Delivery coverage and delivery fee.
- Whether pickup is available.
- Whether payment is cash, transfer, QRIS, COD, or a combination.
- Whether the seller wants order records to be treated as confirmed or merely submitted until WhatsApp confirmation.

## 12. Success criteria

The MVP is successful when:
- Customers can browse the menu on mobile and desktop.
- Customers can select product options correctly.
- Customers can combine food and drinks in one cart.
- Checkout validates customer and fulfillment information.
- Backend recalculates prices and stores the order correctly.
- A WhatsApp URL opens with a readable, accurate order summary.
- Seller can manage products, categories, and store settings.
- Seller endpoints are protected.
