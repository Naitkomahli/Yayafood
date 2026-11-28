const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    const err = new Error(json?.message || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return json.data;
}

export function formatRupiah(amount) {
  return `Rp${Number(amount || 0).toLocaleString('id-ID')}`;
}

// Auth
export const getMe = () => request('/auth/me');
export const loginSeller = (body) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
export const logoutSeller = () =>
  request('/auth/logout', { method: 'POST' });

// Categories
export const getSellerCategories = () => request('/seller/categories');
export const createCategory = (body) =>
  request('/seller/categories', { method: 'POST', body: JSON.stringify(body) });
export const updateCategory = (id, body) =>
  request(`/seller/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteCategory = (id) =>
  request(`/seller/categories/${id}`, { method: 'DELETE' });

// Products & Options
export const getSellerProducts = () => request('/seller/products');
export const createProduct = (body) =>
  request('/seller/products', { method: 'POST', body: JSON.stringify(body) });
export const updateProduct = (id, body) =>
  request(`/seller/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deactivateProduct = (id) =>
  request(`/seller/products/${id}`, { method: 'DELETE' });

export const createOptionGroup = (productId, body) =>
  request(`/seller/products/${productId}/option-groups`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
export const deleteOptionGroup = (id) =>
  request(`/seller/option-groups/${id}`, { method: 'DELETE' });
export const createOptionValue = (groupId, body) =>
  request(`/seller/option-groups/${groupId}/values`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
export const deleteOptionValue = (id) =>
  request(`/seller/option-values/${id}`, { method: 'DELETE' });

// Settings
export const getSellerSettings = () => request('/seller/settings');
export const updateSellerSettings = (body) =>
  request('/seller/settings', { method: 'PUT', body: JSON.stringify(body) });

export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_BASE}/seller/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || 'Upload gambar gagal');
  }
  return json.data.imageUrl;
}