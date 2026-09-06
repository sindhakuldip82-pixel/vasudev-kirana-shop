'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAdmin } from '@/hooks';
import AdminNav from '@/components/AdminNav';
import { Product } from '@/types';
import { getDisplayPrice, getUnitPriceLabel } from '@/lib/pricing';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function AdminProductsPage() {
  const { checking, authed } = useRequireAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  async function toggleActive(p: Product) {
    await fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    load();
  }

  async function toggleStock(p: Product) {
    const next = p.stockStatus === 'out_of_stock' ? 'in_stock' : 'out_of_stock';
    await fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockStatus: next }),
    });
    load();
  }

  async function deleteProduct(p: Product) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
    load();
  }

  if (checking || !authed) return null;

  return (
    <div>
      <AdminNav />
      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-gray-900">Products ({products.length})</h1>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1 bg-brand-500 text-white text-sm font-semibold px-3.5 py-2 rounded-xl"
          >
            <Plus size={15} /> Add
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-card p-3 flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{getUnitPriceLabel(p)} · from ₹{getDisplayPrice(p).toFixed(2)}</p>
                  <div className="flex gap-1.5 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${p.stockStatus === 'out_of_stock' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {p.stockStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  <div className="flex gap-1.5">
                    <Link href={`/admin/products/${p.id}/edit`} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600">
                      <Pencil size={14} />
                    </Link>
                    <button onClick={() => deleteProduct(p)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleActive(p)} className="text-[10px] text-brand-600 underline">
                      {p.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <span className="text-gray-300">·</span>
                    <button onClick={() => toggleStock(p)} className="text-[10px] text-brand-600 underline">
                      {p.stockStatus === 'out_of_stock' ? 'Mark in stock' : 'Mark out of stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
