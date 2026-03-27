'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage(): React.ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.refresh();
        router.push('/admin');
      } else {
        setError('Credenciales incorrectas');
      }
    } catch {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sp-admin-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-sp-admin-card border border-sp-admin-border rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <span className="font-display text-2xl font-black uppercase gradient-text">SocialPro</span>
          <p className="text-sm text-sp-admin-muted mt-1">Panel de administracion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-sp-admin-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-sp-admin-border bg-sp-admin-bg px-4 py-3 text-sm text-sp-admin-text outline-none focus:border-sp-admin-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-sp-admin-muted mb-1.5">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-sp-admin-border bg-sp-admin-bg px-4 py-3 text-sm text-sp-admin-text outline-none focus:border-sp-admin-accent transition-colors"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full font-bold text-sp-admin-bg text-sm disabled:opacity-60 bg-sp-admin-accent hover:opacity-90 transition-opacity"
          >
            {loading ? 'Entrando...' : 'Iniciar sesion'}
          </button>
        </form>
      </div>
    </div>
  );
}
