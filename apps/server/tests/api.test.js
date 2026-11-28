const test = require('node:test');
const assert = require('node:assert/strict');

const BASE = process.env.TEST_API_URL || 'http://localhost:5000/api/v1';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const body = await res.json().catch(() => null);
  return { res, body };
}

test('Public catalog endpoints return expected data and hide private settings', async () => {
  const health = await req('/health');
  assert.equal(health.res.status, 200);
  assert.equal(health.body.success, true);

  const store = await req('/store');
  assert.equal(store.res.status, 200);
  assert.equal(store.body.data.businessName, 'YAYA FOOD');
  assert.equal(store.body.data.whatsappNumber, undefined);

  const cats = await req('/categories');
  assert.equal(cats.res.status, 200);
  assert.ok(cats.body.data.length >= 4);

  const geprek = await req('/products/nasi-ayam-geprek');
  assert.equal(geprek.res.status, 200);
  assert.equal(geprek.body.data.price, 13000);
  assert.ok(geprek.body.data.optionGroups.length >= 1);

  const missing = await req('/products/produk-tidak-ada');
  assert.equal(missing.res.status, 404);
});

test('Checkout rejects invalid payloads and missing required options', async () => {
  const empty = await req('/orders/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer: { name: '', phone: '081' }, fulfillment: { method: 'delivery' }, items: [] }),
  });
  assert.equal(empty.res.status, 422);

  const geprek = await req('/products/nasi-ayam-geprek');
  const noOption = await req('/orders/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: { name: 'Tester', phone: '081234567890' },
      fulfillment: { method: 'pickup' },
      items: [{ productId: geprek.body.data.id, quantity: 1, optionValueIds: [] }],
    }),
  });
  assert.equal(noOption.res.status, 422);
});

test('Checkout creates mixed order and calculates total on server', async () => {
  const geprek = (await req('/products/nasi-ayam-geprek')).body.data;
  const aren = (await req('/products/aren-latte')).body.data;
  const optionId = geprek.optionGroups[0].values[0].id;

  const checkout = await req('/orders/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: { name: 'Tester Integration', phone: '081234567890' },
      fulfillment: { method: 'pickup' },
      notes: 'Test otomatis',
      items: [
        { productId: geprek.id, quantity: 2, optionValueIds: [optionId] },
        { productId: aren.id, quantity: 1, optionValueIds: [] },
      ],
    }),
  });

  assert.equal(checkout.res.status, 201);
  assert.equal(checkout.body.data.subtotal, 41000);
  assert.equal(checkout.body.data.deliveryFee, 0);
  assert.equal(checkout.body.data.total, 41000);
  assert.match(checkout.body.data.orderNumber, /^YAYA-/);
  assert.match(checkout.body.data.whatsappUrl, /^https:\/\/wa\.me\//);
});

test('Seller auth protects endpoints and supports category CRUD', async () => {
  const unauth = await req('/seller/settings');
  assert.equal(unauth.res.status, 401);

  const badLogin = await req('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'seller@yayafood.local', password: 'salah' }),
  });
  assert.equal(badLogin.res.status, 401);

  const login = await req('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'seller@yayafood.local', password: 'seller123' }),
  });
  assert.equal(login.res.status, 200);
  assert.equal(login.body.data.password_hash, undefined);

  const setCookie = login.res.headers.get('set-cookie');
  assert.ok(setCookie && setCookie.includes('yaya_token='));
  const cookieHeader = setCookie.split(';')[0];

  const me = await req('/auth/me', { headers: { Cookie: cookieHeader } });
  assert.equal(me.res.status, 200);
  assert.equal(me.body.data.email, 'seller@yayafood.local');

  // Create & Delete test category (cleanup)
  const slug = `test-cat-${Date.now()}`;
  const created = await req('/seller/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({ name: 'Test Category', slug, displayOrder: 99 }),
  });
  assert.equal(created.res.status, 201);

  const deleted = await req(`/seller/categories/${created.body.data.id}`, {
    method: 'DELETE',
    headers: { Cookie: cookieHeader },
  });
  assert.equal(deleted.res.status, 200);
});