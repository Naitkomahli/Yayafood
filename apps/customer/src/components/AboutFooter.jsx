export default function AboutFooter({ store }) {
  return (
    <>
      <section id="about" className="bg-cream py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-ink-soft uppercase">
              TENTANG
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Warung yang masaknya jelas.
            </h2>
            <div className="mt-4 rounded-xl bg-cream-sunk p-5">
              <p className="text-[11px] font-bold tracking-widest text-ink-soft uppercase">
                TENTANG {store?.businessName || 'YAYA FOOD'}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                {store?.description ||
                  'Masakan rumahan YAYA FOOD bersama minuman Terracha dalam satu toko dan satu keranjang.'}
              </p>
            </div>
          </div>

          <div
            id="contact"
            className="rounded-xl border border-line bg-paper p-6"
          >
            <h3 className="font-display text-base font-extrabold text-ink">
              Kontak &amp; pesanan
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-line pb-2">
                <dt className="text-ink-soft">Alamat</dt>
                <dd className="text-right font-medium text-ink">
                  {store?.address || 'Belum diisi'}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line pb-2">
                <dt className="text-ink-soft">Delivery</dt>
                <dd className="font-medium text-ink">
                  {store?.deliveryEnabled ? 'Tersedia' : 'Tidak tersedia'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Pickup</dt>
                <dd className="font-medium text-ink">
                  {store?.pickupEnabled ? 'Tersedia' : 'Tidak tersedia'}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-ink-soft">
              Pemesanan dikirim lewat WhatsApp setelah checkout.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-ink py-6 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-sm font-extrabold tracking-tight text-white">
              YAYA FOOD
            </span>
            <span className="text-xs font-bold tracking-[0.16em] text-pink">
              TERRACHA
            </span>
          </div>
          <p className="text-xs text-pink">
            Pesan lewat WhatsApp · Tanpa akun
          </p>
        </div>
      </footer>
    </>
  );
}