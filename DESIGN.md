# UX_SPEC.md — YAYA FOOD

## 1. Design direction

Create a modern, warm, appetizing, and minimal restaurant website. It should feel like a real restaurant brand, not a generic admin template.

Primary brand: YAYA FOOD  
Beverage brand: Terracha

Visual characteristics:
- Warm and welcoming.
- Clean layouts with generous spacing.
- Appetizing, authentic food photography.
- Clear product names and prices.
- Simple ordering interactions.
- Mobile-first responsive design.

## 2. Initial color tokens

| Token | Hex | Intended use |
|---|---|---|
| Cream | `#F8EFE6` | Main backgrounds |
| Dark Brown | `#512C20` | Headings and primary text |
| Terracotta | `#B86F58` | Prices and primary actions |
| Soft Pink | `#E7C9B9` | Soft accents |
| Olive Green | `#71845C` | Natural/beverage accents |
| White | `#FFFFFF` | Cards and contrast surfaces |

These are initial tokens and may be refined after visual testing.

## 3. Typography

- Use a modern, readable typeface.
- Headings should be distinctive but not overly decorative.
- Body text must remain easy to read.
- Prices must be visually clear.
- Maintain a consistent type scale.

## 4. Customer website

### Navigation
- YAYA FOOD identity/logo.
- Links to page sections: Home, Menu, About, Contact.
- Cart access with item count.
- Mobile-friendly navigation.

### Home section
- Hero headline and short restaurant introduction.
- Primary CTA to explore the menu.
- Featured menu items.
- Warm visual treatment and authentic product imagery.

### Category section
- Clear category navigation.
- Initial categories: Menu Ayam, Nasi Goreng & Kwetiau, Terracha Coffee, Terracha Matcha.

### Menu section
- Responsive product cards.
- Product image, name, price, and availability.
- Category filtering.
- Clear add-to-cart action.
- Avoid overcrowding cards.

### Product detail
- Product image.
- Product name and description.
- Price.
- Quantity selector.
- Required option controls.
- Add-to-cart action.
- Clearly show selected options.

### Cart
- List selected products and options.
- Quantity controls.
- Remove action.
- Subtotal and total.
- Clear checkout action.
- Empty-cart state.

### Checkout
- Customer name and WhatsApp number.
- Delivery or pickup selection.
- Conditional delivery address field.
- Optional notes.
- Final order summary.
- Clear submit/order-to-WhatsApp action.
- Validation messages near relevant fields.

### WhatsApp handoff
- Explain that WhatsApp will open with a prepared message.
- Do not claim the message has already been sent.
- Provide a clear fallback if the WhatsApp link cannot be opened.

### About and footer
- Use only business information supplied by the owner.
- Do not invent address, operating hours, claims, or contact details.

## 5. Terracha visual treatment

Terracha is a beverage brand inside YAYA FOOD, not a separate store.

It may receive a distinct visual accent for coffee and matcha products while remaining part of the same customer experience and cart.

## 6. Seller dashboard

Design direction:
- Functional and clean.
- Clear navigation.
- Readable tables and forms.
- Responsive on desktop, tablet, and mobile.
- Consistent brand accents without sacrificing usability.

Pages:
1. Login.
2. Dashboard overview.
3. Product list.
4. Create/edit product.
5. Category management.
6. Business settings.

## 7. Responsive behavior

Customer website:
- Mobile-first.
- Responsive product grid.
- Touch-friendly controls.
- Cart remains easy to access.
- Checkout forms fit small screens.
- No horizontal overflow.

Seller dashboard:
- Desktop/tablet optimized.
- Mobile remains usable.
- Tables should adapt to narrow screens.

## 8. UX principles

- Keep ordering steps simple.
- Make prices immediately visible.
- Make unavailable states obvious.
- Show selected variations clearly.
- Give feedback when an item is added to cart.
- Prevent invalid checkout.
- Keep order summary easy to review.
- Make WhatsApp handoff explicit.

## 9. Accessibility

- Maintain readable contrast.
- Use semantic HTML.
- Provide labels for form controls.
- Provide meaningful alt text.
- Support keyboard navigation.
- Do not communicate status by color alone.
- Show clear validation and error messages.

## 10. Restrictions

- Avoid generic dashboard aesthetics on the customer website.
- Avoid excessive gradients and unnecessary animation.
- Avoid overcrowded product cards.
- Do not use random stock food images as final business assets.
- Do not invent business information.
- Do not present generated imagery as actual product photography.
- Keep YAYA FOOD and Terracha visually related.

## 11. Implementation sequence

1. Establish design tokens and typography.
2. Build global layout and navigation.
3. Build reusable product cards.
4. Build homepage and menu sections.
5. Build product selection and options.
6. Build cart.
7. Build checkout.
8. Build WhatsApp handoff.
9. Build seller dashboard.
10. Verify mobile and desktop layouts.
