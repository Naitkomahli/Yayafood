const API_BASE = import.meta.env.VITE_API_URL ||'http://localhost:5000/api/v1';

async function request(path) {
    const res = await fetch(`${API_BASE}${path}`);
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Gagal memuat data');
    }
    return json.data;
}

export function fetchStore(){
    return request('/store');
}

export function fetchCategories(){
    return request('/categories');
}

export function fetchProducts(params = {}){
    const query = new URLSearchParams();
    if(params.category) query.set('category', params.category);
    if(params.search) query.set('search', params.search);
    const qs = query.toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
}

export function formatRupiah(amount) {
    return `Rp${Number(amount || 0).toLocaleString('id-ID')}`;
}

export async function submitOrder(payload) {
  const res = await fetch(`${API_BASE}/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || 'Gagal mengirim pesanan');
  }
  return json.data;
}