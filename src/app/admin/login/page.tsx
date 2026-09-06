'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError('Invalid username or password.');
        setLoading(false);
        return;
      }
      router.replace('/admin/dashboard');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow-card p-6">
        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center text-xl mb-2">
            🛒
          </div>
          <h1 className="font-bold text-gray-900">Vasudev Kirana Shop</h1>
          <p className="text-xs text-gray-400">Admin Login</p>
        </div>

        <label className="text-xs font-semibold text-gray-500">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mt-1 mb-3 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
          autoComplete="username"
        />

        <label className="text-xs font-semibold text-gray-500">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mt-1 mb-4 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
          autoComplete="current-password"
        />

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-brand-500 text-white font-semibold text-sm py-3 rounded-xl disabled:opacity-50"
        >
          <Lock size={14} /> {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-[11px] text-gray-400 mt-4 text-center">
          Default demo credentials are set in <code>.env</code> (ADMIN_USERNAME / ADMIN_PASSWORD).
        </p>
      </form>
    </div>
  );
}
