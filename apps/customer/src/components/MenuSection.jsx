import { formatRupiah } from '../lib/api';

export default function MenuSection({
  categories,
  products,
  loading,
  error,
  activeCategory,
  onSelectCategory,
  search,
  onSearchChange,
  onRetry,
  onSelectProduct,
  onQuickAdd,
}) {
  if (loading) {
    return (
      <section id="menu" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-xl border border-line bg-paper p-6">
          <h2 className="font-display text-lg font-extrabold text-ink">Memuat menu</h2>
          <p className="mt-1 text-sm text-ink-soft">Tunggu sebentar, katalog sedang diambil.</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="menu" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-xl border border-line bg-paper p-6">
          <h2 className="font-display text-lg font-extrabold text-ink">Gagal memuat</h2>
          <p className="mt-1 text-sm text-ink-soft">Periksa koneksi internet dan coba lagi.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 cursor-pointer rounded-lg bg-terracotta-deep px-4 py-2 text-sm font-bold text-white hover:bg-ink"
          >
            Coba lagi
          </button>
        </div>
      </section>
    );
  }

  const filtered = products.filter((p) => {
    const matchCat = !activeCategory || p.category?.slug === activeCategory;
    const matchSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.trim().toLowerCase());
    return matchCat && matchSearch;
  });

  const terrachaDrinks = products
    .filter((p) => p.category?.slug?.startsWith('terracha'))
    .slice(0, 2);

  return (
    <div id="menu">
      {/* CategoryBar */}
      <div className="border-y border-line bg-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectCategory('')}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition ${
                activeCategory === ''
                  ? 'bg-terracotta-deep text-white'
                  : 'border border-line bg-cream text-ink hover:border-ink'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => {
              const active = activeCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(active ? '' : cat.slug)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    active
                      ? 'bg-terracotta-deep text-white'
                      : 'border border-line bg-paper text-ink hover:border-ink'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
          <span className="text-xs font-medium text-ink-soft">
            {filtered.length} produk
          </span>
        </div>
      </div>

      {/* Menu Grid */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-ink-soft uppercase">
              MENU
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Pilih makanannya dulu.
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari menu..."
              className="w-full rounded-lg border border-line bg-paper px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft focus:border-terracotta-deep focus:outline-none sm:w-60"
            />
            <span className="hidden text-xs font-medium text-ink-soft sm:inline">
              Harga per porsi
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-8 rounded-xl border border-line bg-paper p-8 text-center text-sm text-ink-soft">
            Menu tidak ditemukan.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            {filtered.map((item) => {
              const optCount = item.optionGroups?.reduce(
                (acc, g) => acc + g.values.length,
                0
              );
              const subText =
                optCount > 0
                  ? `${optCount} pilihan opsi`
                  : item.description || '';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectProduct(item)}
                  className={`flex cursor-pointer flex-col justify-between rounded-xl border border-line bg-paper p-3 transition hover:border-terracotta sm:p-4 ${
                    !item.isAvailable ? 'opacity-65' : ''
                  }`}
                >
                  <div>
                    <div className="relative overflow-hidden rounded-lg bg-cream-sunk">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-32 w-full object-cover sm:h-40"
                        />
                      ) : (
                        <div className="flex h-32 w-full items-center justify-center text-[11px] font-bold tracking-wider text-ink-soft sm:h-40">
                          FOTO PRODUK
                        </div>
                      )}
                      {!item.isAvailable && (
                        <span className="absolute top-2 right-2 rounded bg-ink px-2 py-0.5 text-[10px] font-bold text-white">
                          HABIS
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-[11px] font-bold tracking-wider text-ink-soft uppercase">
                      {item.category?.name}
                    </p>
                    <h3 className="mt-1 font-display text-sm font-extrabold text-ink sm:text-base">
                      {item.name}
                    </h3>
                    {subText && (
                      <p className="mt-0.5 text-xs text-ink-soft">{subText}</p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-terracotta-deep sm:text-base">
                      {formatRupiah(item.price)}
                    </span>
                    {item.isAvailable ? (
                      <button
                        type="button"
                        aria-label={`Tambah ${item.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAdd(item);
                        }}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-ink text-base font-bold text-white transition hover:bg-terracotta-deep"
                      >
                        +
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-ink-soft">
                        Tidak tersedia
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* TerrachaBand */}
      {terrachaDrinks.length > 0 && (
        <section className="bg-ink py-12 text-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-pink uppercase">
                TERRACHA
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">
                Kopi dan matcha, satu keranjang.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-pink">
                Minuman Terracha dipesan bersama makanan YAYA FOOD. Tidak perlu dua pesanan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {terrachaDrinks.map((drink) => (
                <button
                  key={drink.id}
                  type="button"
                  onClick={() => onSelectProduct(drink)}
                  className="cursor-pointer rounded-xl border border-white/15 bg-white/10 p-4 text-left transition hover:bg-white/15"
                >
                  <p className="font-display text-sm font-extrabold text-white">
                    {drink.name}
                  </p>
                  <p className="mt-2 text-sm font-bold text-pink">
                    {formatRupiah(drink.price)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}