export default function Navbar({ cartCount, onOpenCart }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#home" className="flex items-center gap-2.5">
          <span className="font-display text-lg font-extrabold tracking-tight text-ink">
            YAYA FOOD
          </span>
          <span className="text-xs font-bold tracking-[0.16em] text-olive-deep">
            TERRACHA
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft sm:flex">
          <a href="#menu" className="hover:text-ink">Menu</a>
          <a href="#about" className="hover:text-ink">Tentang</a>
          <a href="#contact" className="hover:text-ink">Kontak</a>
        </nav>

        <button
          type="button"
          onClick={onOpenCart}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink bg-paper px-3.5 py-2 text-sm font-bold text-ink transition hover:bg-cream-sunk"
        >
          <span>Keranjang</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta-deep px-1.5 text-xs text-white">
            {cartCount}
          </span>
        </button>
      </div>
    </header>
  );
}