'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRequireAdmin } from '@/hooks';
import AdminNav from '@/components/AdminNav';
import ProductForm from '@/components/ProductForm';
import { Category, Product } from '@/types';

export default function EditProductPage() {
  const { checking, authed } = useRequireAdmin();
  const params = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authed) return;
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch(`/api/products/${params.id}`).then((r) => r.json()),
    ]).then(([c, p]) => {
      setCategories(c.categories || []);
      setProduct(p.product || null);
    }).finally(() => setLoading(false));
  }, [authed, params.id]);

  if (checking || !authed) return null;

  return (
    <div>
      <AdminNav />
      <div className="max-w-2xl mx-auto px-4 py-5">
        <Link href="/admin/products" className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <ArrowLeft size={15} /> Back to products
        </Link>
        <h1 className="text-lg font-bold text-gray-900 mb-4">Edit Product</h1>
        {loading ? <p className="text-sm text-gray-400">Loading...</p> : product && categories.length ? (
          <ProductForm categories={categories} initial={product} />
        ) : (
          <p className="text-sm text-red-500">Product could not be loaded.</p>
        )}
      </div>
    </div>
  );
}
