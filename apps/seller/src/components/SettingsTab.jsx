import { useState } from 'react';
import { updateSellerSettings } from '../lib/api';

export default function SettingsTab({ settings, onRefresh }) {
  const [form, setForm] = useState({
    businessName: settings?.businessName || 'YAYA FOOD',
    beverageBrandName: settings?.beverageBrandName || 'Terracha',
    description: settings?.description || '',
    whatsappNumber: settings?.whatsappNumber || '',
    address: settings?.address || '',
    deliveryEnabled: settings?.deliveryEnabled ?? true,
    pickupEnabled: settings?.pickupEnabled ?? true,
    deliveryFee: String(settings?.deliveryFee ?? 0),
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');
    try {
      await updateSellerSettings({
        businessName: form.businessName.trim(),
        beverageBrandName: form.beverageBrandName.trim() || null,
        description: form.description.trim() || null,
        whatsappNumber: form.whatsappNumber.trim(),
        address: form.address.trim() || null,
        operatingHours: settings?.operatingHours || null,
        deliveryEnabled: form.deliveryEnabled,
        pickupEnabled: form.pickupEnabled,
        deliveryFee: Number(form.deliveryFee) || 0,
      });
      setMsg('Pengaturan toko berhasil disimpan.');
      await onRefresh();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-extrabold text-ink">
        Pengaturan Toko
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Atur nomor WhatsApp tujuan pesanan, alamat, dan ongkir.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-xl border border-line bg-paper p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-ink">Nama Bisnis</label>
            <input
              type="text"
              required
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink">Brand Minuman</label>
            <input
              type="text"
              value={form.beverageBrandName}
              onChange={(e) => setForm({ ...form, beverageBrandName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink">
            Nomor WhatsApp Seller (contoh: 6281234567890)
          </label>
          <input
            type="text"
            required
            value={form.whatsappNumber}
            onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3.5 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-ink">Deskripsi</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3.5 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-ink">Alamat Warung</label>
          <textarea
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3.5 py-2 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-ink">Ongkir Delivery (Rp)</label>
            <input
              type="number"
              min="0"
              value={form.deliveryFee}
              onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3.5 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col justify-end gap-2 pb-1 text-sm font-semibold text-ink">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.deliveryEnabled}
                onChange={(e) => setForm({ ...form, deliveryEnabled: e.target.checked })}
              />
              Aktifkan Delivery
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.pickupEnabled}
                onChange={(e) => setForm({ ...form, pickupEnabled: e.target.checked })}
              />
              Aktifkan Pickup (Ambil sendiri)
            </label>
          </div>
        </div>

        {msg && (
          <p className="rounded-lg bg-olive-deep/15 p-3 text-xs font-bold text-olive-deep">
            {msg}
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-pink/50 p-3 text-xs font-bold text-terracotta-deep">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer rounded-lg bg-terracotta-deep px-6 py-2.5 text-sm font-bold text-white hover:bg-ink disabled:opacity-60"
        >
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </form>
    </div>
  );
}