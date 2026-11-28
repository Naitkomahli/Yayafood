import { useState } from 'react';
import {
  createOptionGroup,
  createOptionValue,
  createProduct,
  deactivateProduct,
  deleteOptionGroup,
  deleteOptionValue,
  formatRupiah,
  updateProduct,
  uploadProductImage,
} from '../lib/api';

function toSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const EMPTY_FORM = {
  categoryId: '',
  name: '',
  slug: '',
  description: '',
  price: '',
  imageUrl: '',
  isAvailable: true,
  displayOrder: 0,
};

export default function ProductsTab({ products, categories, onRefresh }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null); // null | 'new' | productObj
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // State tambah opsi saat edit produk
  const [newGroupName, setNewGroupName] = useState('');
  const [newValueByGroup, setNewValueByGroup] = useState({});

  function openCreate() {
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id || '' });
    setEditingProduct('new');
    setError('');
  }

  function openEdit(p) {
    setForm({
      categoryId: p.category?.id || '',
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      price: String(p.price),
      imageUrl: p.imageUrl || '',
      isAvailable: p.isAvailable,
      displayOrder: p.displayOrder || 0,
    });
    setEditingProduct(p);
    setError('');
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        categoryId: form.categoryId,
        name: form.name.trim(),
        slug: form.slug.trim() || toSlug(form.name),
        description: form.description.trim() || null,
        price: Number(form.price),
        imageUrl: form.imageUrl.trim() || null,
        isAvailable: form.isAvailable,
        displayOrder: Number(form.displayOrder) || 0,
      };
      if (editingProduct === 'new') {
        await createProduct(payload);
      } else {
        await updateProduct(editingProduct.id, payload);
      }
      setEditingProduct(null);
      await onRefresh();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan produk');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id) {
    if (!confirm('Nonaktifkan produk ini?')) return;
    await deactivateProduct(id);
    await onRefresh();
  }

  async function handleAddGroup(productId) {
    if (!newGroupName.trim()) return;
    await createOptionGroup(productId, { name: newGroupName.trim(), isRequired: true });
    setNewGroupName('');
    await onRefresh();
    setEditingProduct(null);
  }

  async function handleAddValue(groupId) {
    const valName = (newValueByGroup[groupId] || '').trim();
    if (!valName) return;
    await createOptionValue(groupId, { name: valName, additionalPrice: 0 });
    setNewValueByGroup((prev) => ({ ...prev, [groupId]: '' }));
    await onRefresh();
    setEditingProduct(null);
  }

  const filtered = products.filter((p) => {
    const matchSearch =
      !search.trim() || p.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'available' && p.isAvailable) ||
      (statusFilter === 'unavailable' && !p.isAvailable);
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Produk</h1>
          <p className="mt-1 text-sm text-ink-soft">{products.length} total menu terdaftar.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="cursor-pointer rounded-lg bg-terracotta-deep px-4 py-2.5 text-sm font-bold text-white hover:bg-ink"
        >
          + Tambah produk
        </button>
      </div>

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama produk..."
          className="w-full rounded-lg border border-line bg-paper px-3.5 py-2 text-sm text-ink focus:border-terracotta-deep focus:outline-none sm:w-72"
        />
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'available', label: 'Tersedia' },
            { id: 'unavailable', label: 'Habis' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold ${
                statusFilter === f.id
                  ? 'bg-ink text-white'
                  : 'border border-line bg-paper text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-cream/60 text-xs font-bold text-ink-soft uppercase">
            <tr>
              <th className="px-4 py-3">Produk</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Harga</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-cream/30">
                <td className="px-4 py-3 font-bold text-ink">
                  {p.name}
                  {p.optionGroups?.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-ink-soft">
                      ({p.optionGroups.length} grup opsi)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-soft">{p.category?.name}</td>
                <td className="px-4 py-3 font-bold text-terracotta-deep">
                  {formatRupiah(p.price)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      p.isAvailable
                        ? 'bg-olive-deep/15 text-olive-deep'
                        : 'bg-pink/60 text-terracotta-deep'
                    }`}
                  >
                    {p.isAvailable ? 'Tersedia' : 'Habis'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="cursor-pointer text-xs font-bold text-ink underline hover:text-terracotta-deep"
                  >
                    Edit
                  </button>
                  {p.isAvailable && (
                    <button
                      type="button"
                      onClick={() => handleDeactivate(p.id)}
                      className="ml-3 cursor-pointer text-xs font-medium text-ink-soft underline hover:text-terracotta-deep"
                    >
                      Nonaktifkan
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Create / Edit */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4"
          onClick={() => setEditingProduct(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-paper p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="font-display text-lg font-extrabold text-ink">
                {editingProduct === 'new' ? 'Tambah produk' : 'Edit produk'}
              </h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="cursor-pointer text-lg font-bold text-ink-soft"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-ink">Kategori</label>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3 py-2 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-ink">Nama produk</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                        slug: editingProduct === 'new' ? toSlug(e.target.value) : form.slug,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink">Slug</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-ink">Harga (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink">Urutan tampil</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink">Deskripsi (opsional)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink">Foto Produk (opsional)</label>
                <div className="mt-1 flex items-center gap-3">
                  {form.imageUrl && (
                    <img
                      src={form.imageUrl}
                      alt={form.name || 'Preview'}
                      className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover"
                    />
                  )}
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        setError('');
                        try {
                          const url = await uploadProductImage(file);
                          setForm((prev) => ({ ...prev, imageUrl: url }));
                        } catch (err) {
                          setError(err.message || 'Upload foto gagal');
                        } finally {
                          setUploading(false);
                        }
                      }}
                      className="block w-full text-xs text-ink-soft file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-terracotta-deep"
                    />
                    {uploading && (
                      <p className="text-[11px] font-bold text-terracotta-deep">Mengunggah foto...</p>
                    )}
                    <input
                      type="text"
                      placeholder="atau tempel URL gambar..."
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      className="w-full rounded-lg border border-line bg-cream/40 px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                />
                Produk tersedia (bisa dipesan)
              </label>

              {error && (
                <p className="rounded-lg bg-pink/50 p-2.5 text-xs font-bold text-terracotta-deep">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="cursor-pointer rounded-lg border border-line px-4 py-2 text-xs font-bold text-ink"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer rounded-lg bg-terracotta-deep px-5 py-2 text-xs font-bold text-white hover:bg-ink"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>

            {/* Kelola Opsi (khusus saat Edit) */}
            {editingProduct !== 'new' && (
              <div className="mt-6 border-t border-line pt-4">
                <h3 className="text-xs font-bold tracking-wider text-ink-soft uppercase">
                  Opsi Produk
                </h3>
                <div className="mt-2 space-y-3">
                  {(editingProduct.optionGroups || []).map((g) => (
                    <div key={g.id} className="rounded-lg bg-cream p-3 text-xs">
                      <div className="flex items-center justify-between font-bold text-ink">
                        <span>{g.name}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteOptionGroup(g.id);
                            await onRefresh();
                            setEditingProduct(null);
                          }}
                          className="cursor-pointer text-terracotta-deep underline"
                        >
                          Hapus grup
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {g.values.map((v) => (
                          <span
                            key={v.id}
                            className="inline-flex items-center gap-1 rounded bg-paper px-2 py-1 text-ink"
                          >
                            {v.name}
                            <button
                              type="button"
                              onClick={async () => {
                                await deleteOptionValue(v.id);
                                await onRefresh();
                                setEditingProduct(null);
                              }}
                              className="cursor-pointer font-bold text-terracotta-deep"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          placeholder="Tambah pilihan..."
                          value={newValueByGroup[g.id] || ''}
                          onChange={(e) =>
                            setNewValueByGroup((prev) => ({ ...prev, [g.id]: e.target.value }))
                          }
                          className="flex-1 rounded border border-line bg-paper px-2 py-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddValue(g.id)}
                          className="cursor-pointer rounded bg-ink px-2.5 py-1 font-bold text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Nama grup opsi baru (misal: Level Pedas)"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="flex-1 rounded-lg border border-line bg-cream/40 px-3 py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddGroup(editingProduct.id)}
                    className="cursor-pointer rounded-lg bg-ink px-3 py-1.5 font-bold text-white"
                  >
                    + Grup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}