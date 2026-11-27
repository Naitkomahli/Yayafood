export default function Hero() {
  return (
    <section id="home" className="bg-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-16">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-ink-soft uppercase">
            YAYA FOOD &nbsp;·&nbsp; TERRACHA
          </p>
          <h1 className="mt-4 font-display text-4xl leading-[1.1] font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Nasi goreng.
            <br />
            Ayam geprek.
            <br />
            Kopi. Satu nota.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft">
            Menu warung YAYA FOOD dan minuman Terracha. Pilih, masukkan keranjang, lalu kirim pesanannya lewat WhatsApp.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#menu"
              className="rounded-lg bg-terracotta-deep px-6 py-3 text-sm font-bold text-white transition hover:bg-ink"
            >
              Lihat menu
            </a>
            <a
              href="#about"
              className="rounded-lg border border-ink px-6 py-3 text-sm font-bold text-ink transition hover:bg-paper"
            >
              Cara pesan
            </a>
          </div>
          <p className="mt-3 text-xs font-medium text-ink-soft">
            Tanpa akun. Tanpa aplikasi.
          </p>
        </div>

        {/* PhotoSlot Hero */}
        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-terracotta bg-cream-sunk p-8 text-center lg:min-h-[420px]">
          <p className="text-[11px] font-bold tracking-[0.18em] text-ink-soft">
            FOTO PRODUK · PLACEHOLDER
          </p>
          <p className="mt-2 font-display text-xl font-extrabold text-ink">
            Nasi Ayam Geprek
          </p>
          <p className="mt-1 text-xs text-ink-soft">ganti dengan foto asli</p>
        </div>
      </div>
    </section>
  );
}