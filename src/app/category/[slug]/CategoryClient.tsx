'use client';

import { Category, Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import ProductCard from '@/components/ProductCard';

export default function CategoryClient({
  category,
  products,
}: {
  category: Category;
  products: Product[];
}) {
  const { lang } = useLanguage();
  return (
    <div className="px-4 pt-4">
      <h1 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">{category.icon}</span>
        {lang === 'gu' && category.gujaratiName ? category.gujaratiName : category.name}
      </h1>
      {products.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
