'use client';

import { useEffect, useState } from 'react';
import { useRequireAdmin } from '@/hooks';
import AdminNav from '@/components/AdminNav';
import { Category } from '@/types';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { checking, authed } = useRequireAdmin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [gujaratiName, setGujaratiName] = useState('');
  const [icon, setIcon] = useState('🛒');

  function load() {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories((d.categories || []).sort((a: Category, b: Category) => a.sortOrder - b.sortOrder)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Category name is required.');
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, gujaratiName, icon }),
    });
    if (!res.ok) {
      setError('Could not add category.');
      return;
    }
    setName('');
    setGujaratiName('');
    setIcon('🛒');
    load();
  }

  async function remove(c: Category) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    const res = await fetch(`/api/categories/${c.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.error || 'Could not delete category.');
      return;
    }
    load();
  }

  async function move(c: Category, direction: -1 | 1) {
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((x) => x.id === c.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/categories/${a.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: b.sortOrder }) }),
      fetch(`/api/categories/${b.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: a.sortOrder }) }),
    ]);
    load();
  }

  if (checking || !authed) return null;

  return (
    <div>
      <AdminNav />
      <div className="max-w-2xl mx-auto px-4 py-5">
        <h1 className="text-lg font-bold text-gray-900 mb-4">Categories</h1>

        <form onSubmit={addCategory} className="bg-white rounded-2xl shadow-card p-4 mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Add category</p>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🛒" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center outline-none focus:ring-2 focus:ring-brand-300" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (English)" className="col-span-2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300" />
          </div>
          <input value={gujaratiName} onChange={(e) => setGujaratiName(e.target.value)} placeholder="Name (Gujarati)" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300 mb-2" />
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <button type="submit" className="w-full flex items-center justify-center gap-1.5 bg-brand-500 text-white text-sm font-semibold py-2.5 rounded-xl">
            <Plus size={14} /> Add category
          </button>
        </form>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map((c) => (
              <div key={c.id} className="bg-white rounded-xl shadow-card p-3 flex items-center gap-3">
                <span className="text-xl">{c.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                  {c.gujaratiName && <p className="text-xs text-gray-400">{c.gujaratiName}</p>}
                </div>
                <button onClick={() => move(c, -1)} className="text-gray-400"><ChevronUp size={16} /></button>
                <button onClick={() => move(c, 1)} className="text-gray-400"><ChevronDown size={16} /></button>
                <button onClick={() => remove(c)} className="text-red-400"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
