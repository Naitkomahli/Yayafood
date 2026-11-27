import { useState } from 'react';
import { formatRupiah } from '../lib/api';

function DrawerContent({ product, onClose, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [added, setAdded] = useState(false);

  const extraPerUnit = Object.values(selectedOptions).reduce(
    (sum, opt) => sum + Number(opt.additionalPrice || 0),
    0
  );
  const lineTotal = (Number(product.price) + extraPerUnit) * quantity;

  function handleAdd() {
    for (const group of product.optionGroups || []) {
      if (group.isRequired && !selectedOptions[group.id]) {
        setErrorMsg(`Pilih ${group.name} terlebih dahulu.`);
        return;
      }
    }

    setErrorMsg('');
    onAddToCart(product, Object.values(selectedOptions), quantity);
    setAdded(true);
  }

  return (
    <aside
      className="flex h-full w-full max-w-[560px] flex-col bg-paper shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drawer Head */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-6">
        <h2 className="font-display text-lg font-extrabold text-ink">
          Detail produk
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup detail produk"
          className="cursor-pointer rounded-lg px-2 py-1 text-lg font-bold text-ink-soft hover:bg-cream hover:text-ink"
        >
          ×
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Drawer Photo */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-60 w-full object-cover"
          />
        ) : (
          <div className="flex h-60 w-full flex-col items-center justify-center bg-cream-sunk px-6 text-center">
            <p className="text-[11px] font-bold tracking-[0.18em] text-ink-soft">
              FOTO PRODUK · PLACEHOLDER
            </p>
            <p className="mt-1.5 font-display text-lg font-extrabold text-ink">
              {product.name}
            </p>
          </div>
        )}

        {/* Drawer Body */}
        <div className="p-6">
          <p className="text-xs font-bold tracking-[0.16em] text-ink-soft uppercase">
            {product.category?.name}
          </p>
          <h3 className="mt-1.5 font-display text-2xl font-extrabold text-ink">
            {product.name}
          </h3>
          <p className="mt-2 text-lg font-bold text-terracotta-deep">
            {formatRupiah(product.price)}
          </p>
          {product.description && (
            <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
              {product.description}
            </p>
          )}

          {/* Option Groups */}
          {(product.optionGroups || []).map((group) => (
            <div key={group.id} className="mt-6 border-t border-line pt-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink">{group.name}</span>
                {group.isRequired && (
                  <span className="text-xs font-bold text-terracotta-deep">
                    Wajib pilih
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-2">
                {group.values
                  .filter((v) => v.isAvailable)
                  .map((val) => {
                    const active = selectedOptions[group.id]?.id === val.id;
                    return (
                      <button
                        key={val.id}
                        type="button"
                        onClick={() => {
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [group.id]: {
                              groupId: group.id,
                              groupName: group.name,
                              id: val.id,
                              name: val.name,
                              additionalPrice: val.additionalPrice,
                            },
                          }));
                          setErrorMsg('');
                          setAdded(false);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition ${
                          active
                            ? 'border-terracotta-deep bg-cream font-bold text-ink'
                            : 'border-line bg-paper text-ink hover:border-terracotta'
                        }`}
                      >
                        <span>{val.name}</span>
                        {val.additionalPrice > 0 && (
                          <span className="text-xs font-bold text-terracotta-deep">
                            +{formatRupiah(val.additionalPrice)}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}

          {/* Qty Row */}
          <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
            <span className="text-sm font-bold text-ink">Jumlah</span>
            <div className="inline-flex items-center gap-3 rounded-lg border border-line bg-cream px-2 py-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-ink text-sm font-bold text-white hover:bg-terracotta-deep"
              >
                –
              </button>
              <span className="w-6 text-center text-sm font-bold text-ink">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-ink text-sm font-bold text-white hover:bg-terracotta-deep"
              >
                +
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="mt-3 text-xs font-bold text-terracotta-deep">
              {errorMsg}
            </p>
          )}
          {added && (
            <p className="mt-3 text-xs font-bold text-olive-deep">
              ✓ Ditambahkan ke keranjang
            </p>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-line bg-paper px-6 py-4">
        <div>
          <p className="text-[11px] font-medium text-ink-soft">Total</p>
          <p className="text-lg font-extrabold text-terracotta-deep">
            {formatRupiah(lineTotal)}
          </p>
        </div>
        <button
          type="button"
          disabled={!product.isAvailable}
          onClick={handleAdd}
          className="cursor-pointer rounded-lg bg-terracotta-deep px-6 py-3 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft"
        >
          {product.isAvailable ? 'Tambah ke keranjang' : 'Produk habis'}
        </button>
      </div>
    </aside>
  );
}

export default function ProductDetailDrawer({ product, onClose, onAddToCart }) {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/45"
      onClick={onClose}
    >
      <DrawerContent
        key={product.id}
        product={product}
        onClose={onClose}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}