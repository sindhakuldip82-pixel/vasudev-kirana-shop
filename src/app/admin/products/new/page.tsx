'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRequireAdmin } from '@/hooks';
import AdminNav from '@/components/AdminNav';
import ProductForm from '@/components/ProductForm';
import { Category } from '@/types';

export default function NewProductPage() {
  const { checking, authed } = useRequireAdmin();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (authed) {
      fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.categories || []));
    }
  }, [authed]);

  if (checking || !authed) return null;

  return (
    <div>
      <AdminNav />
      <div className="max-w-2xl mx-auto px-4 py-5">
        <Link href="/admin/products" className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <ArrowLeft size={15} /> Back to products
        </Link>
        <h1 className="text-lg font-bold text-gray-900 mb-4">Add Product</h1>
        {categories.length > 0 ? (
          <ProductForm categories={categories} />
        ) : (
          <p className="text-sm text-gray-400">
            Add a category first from the Categories tab, then come back here.
          </p>
        )}
      </div>
    </div>
  );
}
