'use client';

import Link from 'next/link';
import { Category } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export default function CategoriesClient({ categories }: { categories: Category[] }) {
  const { lang, t } = useLanguage();
  return (
    <div className="px-4 pt-4">
      <h1 className="text-lg font-bold text-gray-900 mb-4">{t('categories')}</h1>
      <div className="grid grid-cols-3 gap-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="bg-white rounded-2xl shadow-card p-3 flex flex-col items-center gap-1.5 text-center"
          >
            <span className="text-3xl">{c.icon}</span>
            <span className="text-xs font-medium text-gray-700 leading-tight">
              {lang === 'gu' && c.gujaratiName ? c.gujaratiName : c.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
