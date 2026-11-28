import { useState } from 'react';
import { createCategory, deleteCategory, updateCategory } from '../lib/api';

function toSlug(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CategoriesTab({ categories, onRefresh }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || toSlug(name),
        displayOrder: Number(displayOrder) || 0,
        isActive: true,
      };
      if (editingId) {
        await updateCategory(editingId, payload);
      } else {
        await createCategory(payload);
      }
      setName('');
      setSlug('');
      setDisplayOrder(0);
      setEditingId(null);
      await onRefresh();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan kategori');
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await deleteCategory(id);
      await onRefresh();
    } catch (err) {
      setError(err.message || 'Kategori gagal dihapus');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink">Kategori</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Kelola urutan dan daftar kategori menu.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-5 grid gap-3 rounded-xl border border-line bg-paper p-4 sm:grid-cols-4 sm:items-end"
      >
        <div>
          <label className="block text-xs font-bold text-ink">Nama kategori</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editingId) setSlug(toSlug(e.target.value));
            }}
            className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-ink">Slug</label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-ink">Urutan</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 cursor-pointer rounded-lg bg-terracotta-deep py-2.5 text-xs font-bold text-white hover:bg-ink"
          >
            {editingId ? 'Update' : '+ Tambah'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName('');
                setSlug('');
                setDisplayOrder(0);
              }}
              className="cursor-pointer rounded-lg border border-line px-3 py-2 text-xs font-bold"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {error && (
        <p className="mt-3 rounded-lg bg-pink/50 p-3 text-xs font-bold text-terracotta-deep">
          {error}
        </p>
      )}

      <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-cream/60 text-xs font-bold text-ink-soft uppercase">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Urutan</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-bold text-ink">{c.name}</td>
                <td className="px-4 py-3 text-ink-soft">{c.slug}</td>
                <td className="px-4 py-3 text-ink">{c.displayOrder}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(c.id);
                      setName(c.name);
                      setSlug(c.slug);
                      setDisplayOrder(c.displayOrder);
                    }}
                    className="cursor-pointer text-xs font-bold text-ink underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="ml-3 cursor-pointer text-xs font-medium text-ink-soft underline hover:text-terracotta-deep"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}