# AGENT.md — YAYA FOOD

## Role

kamu bagaikan seorang software engineer yang ahli yang sedang mengajariku tentang cara membuat aplikasi fullstack

## First steps

Before changing code:

1. Read `PRD.md`. untuk PRD
2. Read `DESIGN.md`. untuk desgin
3. Read `DATABASE_SCHEMA.md`. untuk skema database
4. Read `API_CONTRACT.md`. untuk contract api
5. Inspect the existing repository and report its current structure.
6. Identify conflicts between the repository and the specifications. Ask before making major architectural changes.

## Product context

YAYA FOOD is one UMKM food-and-beverage business. Terracha is its beverage brand, not a separate seller or store.

The product consists of:

- A public, single-page customer restaurant website.
- A separate seller dashboard.
- One Node.js/Express backend.
- One PostgreSQL database.

Customers do not need accounts. Customers browse products, select options, add food and drinks to one cart, complete checkout, and are redirected to WhatsApp with a prefilled order message. The customer must press Send in WhatsApp; the application does not send WhatsApp messages automatically.

## Required technology

- Customer frontend: React
- Seller frontend: React
- Styling: Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL
- API: REST, prefixed with `/api/v1`

Do not silently replace these technologies. If a dependency or implementation detail needs to change, explain why first.

## Architecture rules

- Keep customer and seller applications separate under `apps/customer` and `apps/seller`.
- Keep the API under `apps/server`.
- Keep database migrations and seed scripts under `database`.
- Frontends must communicate with the backend through HTTP APIs.
- Never connect React directly to PostgreSQL.
- Never expose database credentials, password hashes, or private server configuration to the browser.
- Use environment variables for secrets and configuration.
- Keep modules small and responsibilities clear.

## Business rules

- One store and one seller dashboard.
- Terracha products are managed by YAYA FOOD.
- Initial categories:
  - Nasi Goreng & Kwetiau
  - Menu Ayam
  - Terracha Coffee
  - Terracha Matcha
- Nasi Ayam Geprek options: Tidak Pedas, Pedas Biasa, Pedas Banget.
- Kwetiau options: Goreng, Rebus.
- A cart can contain food and beverages together.
- Customers can choose delivery or pickup, subject to store settings.
- Delivery address is required only for delivery.
- Product availability and required options must be validated by the backend.
- The backend calculates all prices and totals. Never trust prices or totals submitted by the frontend.
- Preserve historical order details using snapshots of product names, prices, and selected options.
- WhatsApp handoff is not proof of message delivery, payment, or seller acceptance.

## Implementation workflow

Work in small, reviewable phases:

1. Repository inspection and project setup.
2. PostgreSQL schema, migrations, and seed data.
3. Public catalog API.
4. Seller authentication and product/category/settings APIs.
5. Customer website and responsive UI.
6. Cart and checkout.
7. Order persistence and WhatsApp Click-to-Chat handoff.
8. Seller dashboard.
9. Integration tests, validation, and documentation.

At the start of each phase:

- State the goal and files expected to change.
- Check relevant existing code.
- Implement only the agreed phase.

At the end of each phase:

- Summarize changes.
- List commands executed.
- Report tests and their results.
- Mention known limitations and next steps.

## Coding standards

- Prefer readable, maintainable code over clever abstractions.
- Validate all request bodies and route parameters.
- Use parameterized SQL or a reputable ORM/query builder.
- Handle errors consistently.
- Use database transactions for creating an order and its order items.
- Use migrations; do not rely on manually editing production tables.
- Avoid duplicating business logic between frontends.
- Do not invent business details such as exact address, opening hours, delivery fee, or seller WhatsApp number. Keep these configurable and ask the user when required.

## UI/UX requirements

Follow `DESIGN.md`.

- Customer site: warm, minimal, mobile-first, single-page navigation.
- Use cream, dark brown, terracotta, soft pink, and olive as initial design tokens.
- Seller dashboard: functional, clean, and responsive.
- Do not use placeholder food imagery as final business assets without clearly marking it as placeholder.
- Do not invent logos or claim generated imagery is the real product photography.

## Security requirements

- Hash seller passwords with Argon2id or bcrypt.
- Protect seller endpoints with authentication and authorization middleware.
- Use secure, HTTP-only cookies or another explicitly documented secure session strategy.
- Rate-limit login and checkout endpoints.
- Apply CORS and security headers appropriately.
- Never log passwords, secrets, or unnecessary customer personal data.
- Use HTTPS in production.

## Definition of done

A phase is complete only when:

- The implementation matches the relevant specification.
- Validation and error states are handled.
- Relevant tests pass, or untested areas are explicitly reported.
- No secrets are committed.
- The user receives a concise summary and clear next step.

## Important instruction

Do not build the entire application in one giant operation. Do not make unapproved assumptions about unresolved business decisions. Ask concise questions when a decision materially affects data structure, checkout, delivery, or payment behavior.
