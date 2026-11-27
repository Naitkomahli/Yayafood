import { useState } from 'react';
import { formatRupiah } from '../lib/api';

export default function CheckoutDrawer({
  open,
  cart,
  store,
  submitting,
  submitError,
  orderResult,
  onBack,
  onClose,
  onSubmitOrder,
}) {
  const deliveryAllowed = store?.deliveryEnabled ?? true;
  const pickupAllowed = store?.pickupEnabled ?? true;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [method, setMethod] = useState(deliveryAllowed ? 'delivery' : 'pickup');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  if (!open) return null;

  if (orderResult) {
    return (
      <div
        className="fixed inset-0 z-50 flex justify-end bg-ink/45"
        onClick={onClose}
      >
        <aside
          className="flex h-full w-full max-w-md flex-col bg-cream shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-line bg-paper px-5 py-4">
            <h2 className="font-display text-lg font-extrabold text-ink">
              Pesanan siap dikirim
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg px-2 py-1 text-lg font-bold text-ink-soft hover:bg-cream"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="rounded-xl border border-line bg-paper p-5">
              <p className="text-[11px] font-bold tracking-widest text-olive-deep uppercase">
                NOMOR ORDER
              </p>
              <p className="mt-1 font-display text-xl font-extrabold text-ink">
                {orderResult.orderNumber}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
                <span className="text-ink-soft">Total</span>
                <span className="font-extrabold text-terracotta-deep">
                  {formatRupiah(orderResult.total)}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-line bg-paper p-5">
              <h3 className="font-display text-base font-extrabold text-ink">
                Lanjutkan di WhatsApp
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                Jika WhatsApp belum terbuka otomatis, klik tombol di bawah lalu tekan <strong>Send / Kirim</strong> di WhatsApp secara manual.
              </p>

              <a
                href={orderResult.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full rounded-lg bg-terracotta-deep py-3 text-center text-sm font-bold text-white transition hover:bg-ink"
              >
                Buka WhatsApp
              </a>

              <button
                type="button"
                onClick={onClose}
                className="mt-2.5 w-full cursor-pointer rounded-lg border border-line py-2.5 text-xs font-bold text-ink hover:bg-cream-sunk"
              >
                Kembali ke menu
              </button>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => {
    const extra = item.selectedOptions.reduce(
      (s, o) => s + Number(o.additionalPrice || 0),
      0
    );
    return sum + (Number(item.product.price) + extra) * item.quantity;
  }, 0);

  function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {};

    if (!customerName.trim()) {
      nextErrors.name = 'Nama wajib diisi.';
    }
    if (!customerPhone.trim()) {
      nextErrors.phone = 'Nomor WhatsApp wajib diisi.';
    }
    if (method === 'delivery' && !address.trim()) {
      nextErrors.address = 'Alamat pengiriman wajib diisi.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmitOrder({
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
      },
      fulfillment: {
        method,
        address: method === 'delivery' ? address.trim() : null,
      },
      notes: notes.trim() || null,
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        optionValueIds: item.selectedOptions.map((o) => o.id),
      })),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/45"
      onClick={onClose}
    >
      <aside
        className="flex h-full w-full max-w-md flex-col bg-cream shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-paper px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="cursor-pointer rounded-lg px-2 py-1 text-base font-bold text-ink hover:bg-cream"
            >
              ←
            </button>
            <div>
              <h2 className="font-display text-lg font-extrabold text-ink">
                Checkout
              </h2>
              <p className="text-[11px] font-medium text-ink-soft">
                Langkah 2 dari 2
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg px-2 py-1 text-lg font-bold text-ink-soft hover:bg-cream"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5">
          {/* Data pemesan */}
          <div>
            <h3 className="font-display text-sm font-extrabold text-ink">
              Data pemesan
            </h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-bold text-ink">Nama</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nama kamu"
                  className="mt-1 w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-terracotta-deep focus:outline-none"
                />
                {errors.name && (
                  <p className="mt-1 text-xs font-bold text-terracotta-deep">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-ink">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="08xx xxxx xxxx"
                  className="mt-1 w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-terracotta-deep focus:outline-none"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs font-bold text-terracotta-deep">
                    {errors.phone}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-ink-soft">
                  Dipakai seller untuk konfirmasi pesanan.
                </p>
              </div>
            </div>
          </div>

          {/* Cara terima */}
          <div className="mt-6">
            <h3 className="font-display text-sm font-extrabold text-ink">
              Cara terima
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {deliveryAllowed && (
                <button
                  type="button"
                  onClick={() => setMethod('delivery')}
                  className={`cursor-pointer rounded-xl border p-3 text-left transition ${
                    method === 'delivery'
                      ? 'border-terracotta-deep bg-paper'
                      : 'border-line bg-paper/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-ink">Diantar</span>
                    {method === 'delivery' && (
                      <span className="text-[10px] font-bold text-terracotta-deep">
                        Dipilih
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-ink-soft">
                    Alamat dikirim ke kurir
                  </p>
                </button>
              )}

              {pickupAllowed && (
                <button
                  type="button"
                  onClick={() => setMethod('pickup')}
                  className={`cursor-pointer rounded-xl border p-3 text-left transition ${
                    method === 'pickup'
                      ? 'border-terracotta-deep bg-paper'
                      : 'border-line bg-paper/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-ink">
                      Ambil sendiri
                    </span>
                    {method === 'pickup' && (
                      <span className="text-[10px] font-bold text-terracotta-deep">
                        Dipilih
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-ink-soft">
                    Ambil di warung
                  </p>
                </button>
              )}
            </div>

            {method === 'delivery' && (
              <div className="mt-3">
                <label className="block text-xs font-bold text-ink">
                  Alamat pengiriman
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jalan, nomor rumah, patokan"
                  className="mt-1 w-full rounded-lg border border-line bg-paper px-3.5 py-2 text-sm text-ink focus:border-terracotta-deep focus:outline-none"
                />
                {errors.address && (
                  <p className="mt-1 text-xs font-bold text-terracotta-deep">
                    {errors.address}
                  </p>
                )}
              </div>
            )}

            <div className="mt-3">
              <label className="block text-xs font-bold text-ink">
                Catatan (opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: sambal dipisah"
                className="mt-1 w-full rounded-lg border border-line bg-paper px-3.5 py-2 text-sm text-ink focus:border-terracotta-deep focus:outline-none"
              />
            </div>
          </div>

          {/* Ringkasan pesanan */}
          <div className="mt-6 rounded-xl border border-line bg-paper p-4">
            <h3 className="font-display text-sm font-extrabold text-ink">
              Ringkasan pesanan
            </h3>
            <div className="mt-3 space-y-2 border-b border-line pb-3 text-xs">
              {cart.map((item) => {
                const extra = item.selectedOptions.reduce(
                  (s, o) => s + Number(o.additionalPrice || 0),
                  0
                );
                const lineTotal =
                  (Number(item.product.price) + extra) * item.quantity;
                return (
                  <div key={item.key} className="flex justify-between gap-2">
                    <span className="text-ink">
                      {item.quantity}× {item.product.name}
                    </span>
                    <span className="font-bold text-ink">
                      {formatRupiah(lineTotal)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="font-bold text-ink">Estimasi subtotal</span>
              <span className="font-extrabold text-terracotta-deep">
                {formatRupiah(subtotal)}
              </span>
            </div>
          </div>

          {submitError && (
            <p className="mt-3 rounded-lg bg-pink/50 p-3 text-xs font-bold text-terracotta-deep">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full cursor-pointer rounded-lg bg-terracotta-deep py-3 text-sm font-bold text-white transition hover:bg-ink disabled:opacity-60"
          >
            {submitting ? 'Memproses pesanan...' : 'Pesan lewat WhatsApp'}
          </button>

          <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-soft">
            WhatsApp akan terbuka dengan pesan yang sudah terisi. Pesanan belum terkirim sampai kamu menekan Kirim di WhatsApp.
          </p>
        </form>
      </aside>
    </div>
  );
}