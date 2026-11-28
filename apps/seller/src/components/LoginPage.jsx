import { useState } from 'react';
import { loginSeller } from '../lib/api';

export default function LoginPage({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginSeller({ email, password });
      onSuccess(user);
    } catch (err) {
      setError(err.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-7 shadow-xs">
        <p className="text-xs font-bold tracking-[0.18em] text-olive-deep uppercase">
          YAYA FOOD · TERRACHA
        </p>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">
          Login Seller
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Masuk untuk mengelola menu, kategori, dan pengaturan toko.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seller@yayafood.local"
              className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink focus:border-terracotta-deep focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink focus:border-terracotta-deep focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-pink/50 p-2.5 text-xs font-bold text-terracotta-deep">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-terracotta-deep py-3 text-sm font-bold text-white transition hover:bg-ink disabled:opacity-60"
          >
            {loading ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}