'use client';

import Link from 'next/link';
import { Category } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export function CategoryChip({ category }: { category: Category }) {
  const { lang } = useLanguage();
  return (
    <Link
      href={`/category/${category.slug}`}
      className="flex flex-col items-center gap-1.5 shrink-0 w-[72px]"
    >
      <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl">
        {category.icon || '🛒'}
      </div>
      <span className="text-[11px] text-center text-gray-700 leading-tight line-clamp-2">
        {lang === 'gu' && category.gujaratiName ? category.gujaratiName : category.name}
      </span>
    </Link>
  );
}
