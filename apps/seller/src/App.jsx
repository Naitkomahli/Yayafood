import { useCallback, useEffect, useState } from 'react';
import {
  formatRupiah,
  getMe,
  getSellerCategories,
  getSellerProducts,
  getSellerSettings,
  logoutSeller,
} from './lib/api';
import LoginPage from './components/LoginPage';
import ProductsTab from './components/ProductsTab';
import CategoriesTab from './components/CategoriesTab';
import SettingsTab from './components/SettingsTab';

const NAV_ITEMS = [
  { id: 'overview', label: 'Ringkasan' },
  { id: 'products', label: 'Produk' },
  { id: 'categories', label: 'Kategori' },
  { id: 'settings', label: 'Pengaturan' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const [prodData, catData, setData] = await Promise.all([
        getSellerProducts(),
        getSellerCategories(),
        getSellerSettings(),
      ]);
      setProducts(prodData);
      setCategories(catData);
      setSettings(setData);
    } catch {
      // ditangani per tab jika gagal
    }
  }, []);

  useEffect(() => {
    getMe()
      .then((u) => {
        setUser(u);
        return loadDashboardData();
      })
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, [loadDashboardData]);

  async function handleLogout() {
    await logoutSeller().catch(() => {});
    setUser(null);
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-sm font-semibold text-ink-soft">
        Memeriksa sesi...
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPage
        onSuccess={(u) => {
          setUser(u);
          loadDashboardData();
        }}
      />
    );
  }

  const availableCount = products.filter((p) => p.isAvailable).length;

  return (
    <div className="min-h-screen bg-cream text-ink md:flex">
      {/* Sidebar */}
      <aside className="flex w-full shrink-0 flex-col justify-between bg-ink p-5 text-white md:min-h-screen md:w-60">
        <div>
          <div className="mb-6">
            <p className="font-display text-lg font-extrabold tracking-tight">
              YAYA FOOD
            </p>
            <p className="text-[11px] font-bold tracking-[0.18em] text-pink">
              TERRACHA
            </p>
          </div>

          <nav className="flex gap-1.5 overflow-x-auto md:flex-col">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex shrink-0 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                    active
                      ? 'bg-terracotta-deep text-white'
                      : 'text-pink hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-6 border-t border-white/15 pt-4">
          <p className="text-xs font-bold text-white">{user.name}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 cursor-pointer text-xs text-pink underline hover:text-white"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-5 sm:p-8">
        {activeTab === 'overview' && (
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink">
              Ringkasan
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Status toko {settings?.businessName || 'YAYA FOOD'} saat ini.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-line bg-paper p-5">
                <p className="text-xs font-bold text-ink-soft">Total Produk</p>
                <p className="mt-2 font-display text-2xl font-extrabold text-ink">
                  {products.length}
                </p>
                <p className="mt-1 text-xs text-olive-deep">
                  {availableCount} tersedia
                </p>
              </div>
              <div className="rounded-xl border border-line bg-paper p-5">
                <p className="text-xs font-bold text-ink-soft">Kategori</p>
                <p className="mt-2 font-display text-2xl font-extrabold text-ink">
                  {categories.length}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-paper p-5">
                <p className="text-xs font-bold text-ink-soft">Nomor WhatsApp</p>
                <p className="mt-2 font-display text-lg font-extrabold text-terracotta-deep">
                  {settings?.whatsappNumber || '-'}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-paper p-5">
                <p className="text-xs font-bold text-ink-soft">Ongkir Delivery</p>
                <p className="mt-2 font-display text-xl font-extrabold text-ink">
                  {formatRupiah(settings?.deliveryFee || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <ProductsTab
            products={products}
            categories={categories}
            onRefresh={loadDashboardData}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesTab
            categories={categories}
            onRefresh={loadDashboardData}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            key={settings?.updatedAt || 'init'}
            settings={settings}
            onRefresh={loadDashboardData}
          />
        )}
      </main>
    </div>
  );
}