# API_CONTRACT.md — YAYA FOOD

## 1. API standards

Base path: `/api/v1`

- REST API.
- JSON request and response bodies.
- UUID resource identifiers.
- ISO 8601 timestamps.
- Currency values are integer IDR.
- Customer endpoints do not require authentication.
- Seller endpoints require authentication and authorization.

## 2. Standard response

Success:

```json
{
  "success": true,
  "data": {},
  "message": "Request successful"
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "customer.name",
      "message": "Customer name is required"
    }
  ]
}
```

## 3. Public endpoints

### GET `/store`

Returns public business information:
- businessName
- beverageBrandName
- description
- address
- operatingHours
- deliveryEnabled
- pickupEnabled

The backend should generate the WhatsApp URL during checkout. Avoid exposing unnecessary internal settings.

### GET `/categories`

Returns active categories, ordered by `display_order`.

### GET `/products`

Returns active catalog products.

Optional query parameters:
- `category`: category slug
- `search`: product-name search
- `page`: page number
- `limit`: page size

Product response fields:
- id
- name
- slug
- description
- price
- imageUrl
- isAvailable
- category
- optionGroups

### GET `/products/:slug`

Returns one product with its available option groups and values.

## 4. Checkout

### POST `/orders/checkout`

Creates an order and returns a WhatsApp Click-to-Chat URL.

Authentication: not required.

Request:

```json
{
  "customer": {
    "name": "Budi",
    "phone": "081234567890"
  },
  "fulfillment": {
    "method": "delivery",
    "address": "Jl. Contoh No. 10, Semarang"
  },
  "notes": "Sambal dipisah",
  "items": [
    {
      "productId": "PRODUCT_UUID_1",
      "quantity": 2,
      "optionValueIds": ["OPTION_VALUE_UUID_1"]
    },
    {
      "productId": "PRODUCT_UUID_2",
      "quantity": 1,
      "optionValueIds": []
    }
  ]
}
```

Validation:
1. Customer name and phone are required.
2. Fulfillment method must be `delivery` or `pickup`.
3. Delivery address is required for delivery.
4. At least one item is required.
5. Quantity must be a positive integer.
6. Products must exist and be available.
7. Selected options must belong to their corresponding products.
8. Required option groups must have valid selections.
9. The same option group must not receive conflicting duplicate selections.

Backend processing:
1. Validate request.
2. Fetch current products and option values.
3. Validate availability and option ownership.
4. Calculate line totals and subtotal.
5. Calculate delivery fee from server-side business settings.
6. Create order and order items in one database transaction.
7. Generate a unique order number.
8. Build a readable WhatsApp message.
9. Generate a `wa.me` Click-to-Chat URL.
10. Return order details and WhatsApp URL.

Response:

```json
{
  "success": true,
  "data": {
    "orderNumber": "YAYA-20261125-0001",
    "subtotal": 38000,
    "deliveryFee": 0,
    "total": 38000,
    "whatsappUrl": "https://wa.me/62XXXXXXXXXX?text=...",
    "message": "Order created successfully"
  }
}
```

Important:
- Never trust client-provided prices, subtotals, or totals.
- Use a database transaction for order persistence.
- Do not claim that WhatsApp received the message.
- Customer must press Send in WhatsApp.
- WhatsApp handoff does not confirm payment or seller acceptance.

## 5. Seller authentication

All seller endpoints require authentication.

Recommended:
- Hash passwords with Argon2id or bcrypt.
- Use secure, HTTP-only cookies with an appropriate session strategy.
- Protect endpoints with authentication and role middleware.
- Never return password hashes.

### POST `/auth/login`

Request:

```json
{
  "email": "seller@example.com",
  "password": "user-supplied-password"
}
```

Returns authenticated seller information and establishes the configured session.

### GET `/auth/me`

Returns the authenticated seller profile.

### POST `/auth/logout`

Ends the seller session.

## 6. Seller product endpoints

All require seller authentication.

### GET `/seller/products`

Returns all products, including unavailable products.

Optional filters:
- `category`
- `search`
- `availability`

### POST `/seller/products`

Creates a product.

Request:

```json
{
  "categoryId": "CATEGORY_UUID",
  "name": "Nasi Ayam Geprek",
  "slug": "nasi-ayam-geprek",
  "description": "Nasi dengan ayam geprek dan sambal",
  "price": 13000,
  "imageUrl": null,
  "isAvailable": true
}
```

### GET `/seller/products/:id`

Returns seller-facing product details, including option groups.

### PUT `/seller/products/:id`

Updates product information.

### DELETE `/seller/products/:id`

Prefer deactivation/soft deletion to preserve historical references.

## 7. Seller category endpoints

All require seller authentication.

- `GET /seller/categories`
- `POST /seller/categories`
- `PUT /seller/categories/:id`
- `DELETE /seller/categories/:id`

Deleting a category should be blocked or handled safely if it still contains products.

## 8. Product option endpoints

All require seller authentication.

Suggested endpoints:
- `POST /seller/products/:productId/option-groups`
- `PUT /seller/option-groups/:id`
- `DELETE /seller/option-groups/:id`
- `POST /seller/option-groups/:groupId/values`
- `PUT /seller/option-values/:id`
- `DELETE /seller/option-values/:id`

Validate that option groups and values belong to the relevant product.

## 9. Seller business settings

All require seller authentication.

- `GET /seller/settings`
- `PUT /seller/settings`

Editable settings:
- Business name.
- Beverage brand name.
- Description.
- WhatsApp number.
- Address.
- Operating hours.
- Delivery enabled.
- Pickup enabled.
- Delivery fee.

## 10. HTTP status codes

| Status | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Invalid request |
| 401 | Authentication required |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Conflict |
| 422 | Validation error |
| 500 | Internal server error |

## 11. WhatsApp message format

Include:
- Order number.
- Customer name and phone.
- Product names.
- Selected variations.
- Quantity.
- Unit price and line subtotal.
- Fulfillment method.
- Delivery address when applicable.
- Customer notes.
- Order total.

URL-encode the message and use the configured store WhatsApp number in `wa.me` format. Normalize the phone number to international format, including Indonesia's `62` country code, without a leading `+`.

The application prepares the message; the customer sends it manually.

## 12. Security

- Validate all request bodies and route parameters.
- Protect all seller endpoints.
- Never expose password hashes or secrets.
- Use parameterized SQL or a safe ORM.
- Rate-limit login and checkout.
- Configure CORS and security headers.
- Use HTTPS in production.
- Avoid logging unnecessary customer personal information.

## 13. Out of scope for MVP

- Payment gateway and QRIS integration.
- Automatic WhatsApp Business API messaging.
- Customer registration and login.
- Loyalty programs.
- Coupons and vouchers.
- Advanced inventory management.
- Multi-store support.
