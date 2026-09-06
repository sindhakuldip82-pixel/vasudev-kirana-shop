'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Product } from '@/types';

export default function StockBadge({ status }: { status: Product['stockStatus'] }) {
  const { t } = useLanguage();
  if (status === 'in_stock') return null;
  const isOut = status === 'out_of_stock';
  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
        isOut ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {isOut ? t('outOfStock') : t('lowStock')}
    </span>
  );
}
