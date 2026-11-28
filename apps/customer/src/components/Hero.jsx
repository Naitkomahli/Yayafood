import { formatRupiah } from '../lib/api';

export default function Hero({ heroProduct }) {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-ink text-white"
    >
      {/* Full-bleed Background Image */}
      {heroProduct?.imageUrl && (
        <img
          src={heroProduct.imageUrl}
          alt={heroProduct.name}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      )}

      {/* Warm Dark Scrim for Accessible Text Contrast */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-ink/92 via-ink/75 to-ink/35"
      />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[380px] max-w-6xl flex-col justify-between px-4 py-10 sm:px-6 lg:min-h-[440px] lg:py-12">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-3 text-[11px] font-bold tracking-[0.22em] text-pink uppercase">
            <span className="h-px w-7 bg-pink" />
            <span>YAYA FOOD · TERRACHA</span>
          </div>

          <h1 className="mt-5 font-display text-4xl leading-[1.04] font-extrabold tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
            Nasi goreng.
            <br />
            Ayam geprek.
            <br />
            Kopi. <span className="text-pink">Satu nota.</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-cream/85">
            Masakan rumahan YAYA FOOD dan seduhan Terracha dalam satu keranjang. Pesan cepat, langsung lanjut ke WhatsApp.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <a
              href="#menu"
              className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-terracotta-deep px-7 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span>Jelajahi menu</span>
              <span aria-hidden="true">→</span>
            </a>
            <a
              href="#about"
              className="inline-flex min-h-12 items-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/20"
            >
              Cara pesan
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-4 text-xs font-medium text-cream/80">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>Tanpa akun</span>
            <span>Makanan &amp; Terracha 1 keranjang</span>
            <span>Kirim via WhatsApp</span>
          </div>

          {heroProduct && (
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-ink/70 px-4 py-1.5 backdrop-blur-sm">
              <span className="font-bold text-white">{heroProduct.name}</span>
              <span className="text-pink">·</span>
              <span className="font-bold text-pink">
                {formatRupiah(heroProduct.price)}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}