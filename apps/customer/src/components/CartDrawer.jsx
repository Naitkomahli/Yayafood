import { formatRupiah } from '../lib/api';

export default function CartDrawer({
  open,
  cart,
  products,
  onClose,
  onUpdateQty,
  onRemove,
  onQuickAdd,
  onCheckout,
}) {
  if (!open) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const extra = item.selectedOptions.reduce(
      (s, o) => s + Number(o.additionalPrice || 0),
      0
    );
    return sum + (Number(item.product.price) + extra) * item.quantity;
  }, 0);

  // Saran 2 produk yang belum ada di keranjang
  const cartProductIds = new Set(cart.map((c) => c.product.id));
  const upsell = products
    .filter((p) => p.isAvailable && !cartProductIds.has(p.id))
    .slice(0, 2);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/45"
      onClick={onClose}
    >
      <aside
        className="flex h-full w-full max-w-md flex-col bg-paper shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-lg font-extrabold text-ink">
              Keranjang
            </h2>
            <span className="rounded-full bg-cream-sunk px-2.5 py-0.5 text-xs font-bold text-ink">
              {totalItems} item
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup keranjang"
            className="cursor-pointer rounded-lg px-2 py-1 text-lg font-bold text-ink-soft hover:bg-cream hover:text-ink"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="mt-8 rounded-xl border border-line bg-cream p-6 text-center">
              <p className="font-display text-base font-extrabold text-ink">
                Keranjang kosong
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Belum ada produk ditambahkan.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 cursor-pointer rounded-lg bg-terracotta-deep px-4 py-2 text-xs font-bold text-white hover:bg-ink"
              >
                Lihat menu
              </button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-line">
                {cart.map((item) => {
                  const extra = item.selectedOptions.reduce(
                    (s, o) => s + Number(o.additionalPrice || 0),
                    0
                  );
                  const lineTotal =
                    (Number(item.product.price) + extra) * item.quantity;
                  const optText = item.selectedOptions
                    .map((o) => o.name)
                    .join(', ');

                  return (
                    <div key={item.key} className="flex gap-3 py-4">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-cream-sunk text-[10px] font-bold text-ink-soft">
                          FOTO
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-ink">
                            {item.product.name}
                          </h3>
                          <span className="shrink-0 text-sm font-bold text-terracotta-deep">
                            {formatRupiah(lineTotal)}
                          </span>
                        </div>

                        {(optText || item.product.description) && (
                          <p className="mt-0.5 text-xs text-ink-soft">
                            {optText || item.product.description}
                          </p>
                        )}

                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-lg border border-line bg-cream">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.key, -1)}
                              className="cursor-pointer px-2.5 py-1 text-xs font-bold text-ink hover:bg-cream-sunk"
                            >
                              −
                            </button>
                            <span className="px-2 text-xs font-bold text-ink">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.key, 1)}
                              className="cursor-pointer px-2.5 py-1 text-xs font-bold text-ink hover:bg-cream-sunk"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemove(item.key)}
                            className="cursor-pointer text-xs font-medium text-ink-soft underline hover:text-terracotta-deep"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Upsell */}
              {upsell.length > 0 && (
                <div className="mt-5 border-t border-line pt-4">
                  <p className="text-[11px] font-bold tracking-widest text-ink-soft uppercase">
                    SERING DIPESAN BARENG
                  </p>
                  <div className="mt-2.5 space-y-2">
                    {upsell.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between rounded-lg bg-cream px-3 py-2.5"
                      >
                        <div>
                          <p className="text-xs font-bold text-ink">{u.name}</p>
                          <p className="text-xs font-semibold text-terracotta-deep">
                            {formatRupiah(u.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onQuickAdd(u)}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-ink text-sm font-bold text-white hover:bg-terracotta-deep"
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Ringkasan */}
        {cart.length > 0 && (
          <div className="border-t border-line bg-paper px-5 py-4">
            <div className="rounded-lg bg-cream p-3.5">
              <p className="text-[11px] font-bold tracking-widest text-ink-soft">
                RINGKASAN
              </p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-ink-soft">Subtotal</span>
                <span className="font-bold text-ink">
                  {formatRupiah(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-ink-soft">
                Ongkir &amp; total final dihitung ulang oleh server saat checkout.
              </p>
            </div>

            <button
              type="button"
              onClick={onCheckout}
              className="mt-3 w-full cursor-pointer rounded-lg bg-terracotta-deep py-3 text-sm font-bold text-white transition hover:bg-ink"
            >
              Lanjut ke checkout
            </button>
            <p className="mt-2 text-center text-[11px] text-ink-soft">
              Pesanan dikirim lewat WhatsApp setelah checkout.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}