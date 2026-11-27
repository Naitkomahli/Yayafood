import { useCallback, useEffect, useState } from 'react';
import { fetchCategories, fetchProducts, fetchStore, submitOrder } from './lib/api';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import ProductDetailDrawer from './components/ProductDetailDrawer';
import AboutFooter from './components/AboutFooter';
import CartDrawer from './components/CartDrawer';
import CheckoutDrawer from './components/CheckoutDrawer';

export default function App() {
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [drawerView, setDrawerView] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderResult, setOrderResult] = useState(null);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('yaya_cart') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('yaya_cart', JSON.stringify(cart));
  }, [cart]);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [storeData, catData, prodData] = await Promise.all([
        fetchStore(),
        fetchCategories(),
        fetchProducts({ limit: 50 }),
      ]);
      setStore(storeData);
      setCategories(catData);
      setProducts(prodData);
    } catch (err) {
      setError(err.message || 'Gagal memuat katalog');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  function addToCart(product, options = [], qty = 1) {
    const optionIds = options.map((o) => o.id).sort().join(',');
    const key = `${product.id}::${optionIds}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { key, product, selectedOptions: options, quantity: qty }];
    });
  }

  function updateCartQty(key, delta) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(key) {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }

  function handleQuickAdd(product) {
    const hasRequired = (product.optionGroups || []).some((g) => g.isRequired);
    if (hasRequired) {
      setSelectedProduct(product);
      return;
    }
    addToCart(product, [], 1);
  }

    async function handleCheckoutSubmit(payload) {
      setSubmitting(true);
      setSubmitError('');
      try {
        const result = await submitOrder(payload);
        setOrderResult(result);
        setCart([]);
        window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        setSubmitError(err.message || 'Gagal memproses pesanan');
      } finally {
        setSubmitting(false);
      }
    }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setDrawerView('cart')}
      />

      <main>
        <Hero />

        <MenuSection
          categories={categories}
          products={products}
          loading={loading}
          error={error}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          search={search}
          onSearchChange={setSearch}
          onRetry={loadCatalog}
          onSelectProduct={setSelectedProduct}
          onQuickAdd={handleQuickAdd}
        />
      </main>

      <AboutFooter store={store} />

      <ProductDetailDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      <CartDrawer
        open={drawerView === 'cart'}
        cart={cart}
        products={products}
        onClose={() => setDrawerView(null)}
        onUpdateQty={updateCartQty}
        onRemove={removeFromCart}
        onQuickAdd={handleQuickAdd}
        onCheckout={() => setDrawerView('checkout')}
      />

      <CheckoutDrawer
        open={drawerView === 'checkout'}
        cart={cart}
        store={store}
        submitting={submitting}
        submitError={submitError}
        orderResult={orderResult}
        onBack={() => setDrawerView('cart')}
        onClose={() => {
          setDrawerView(null);
          setOrderResult(null);
          setSubmitError('');
        }}
        onSubmitOrder={handleCheckoutSubmit}
      />
    </div>
  );
}