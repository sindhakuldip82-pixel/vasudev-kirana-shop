'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { getDisplayPrice, getUnitPriceLabel } from '@/lib/pricing';
import { useLanguage } from '@/context/LanguageContext';
import PriceTag from './PriceTag';
import StockBadge from './StockBadge';

export default function ProductCard({ product }: { product: Product }) {
  const { lang, t } = useLanguage();
  const displayPrice = getDisplayPrice(product);
  const outOfStock = product.stockStatus === 'out_of_stock';

  return (
    <Link
      href={`/product/${product.id}`}
      className={`bg-white rounded-2xl shadow-card overflow-hidden flex flex-col ${
        outOfStock ? 'opacity-60' : ''
      }`}
    >
      <div className="relative aspect-square bg-gray-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 200px"
          className="object-cover"
        />
        {product.offerBadge && (
          <span className="absolute top-1.5 left-1.5 bg-accent-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {product.offerBadge}
          </span>
        )}
        {product.stockStatus !== 'in_stock' && (
          <div className="absolute top-1.5 right-1.5">
            <StockBadge status={product.stockStatus} />
          </div>
        )}
      </div>
      <div className="p-2.5 flex flex-col gap-1 flex-1">
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1">
          {lang === 'gu' && product.gujaratiName ? product.gujaratiName : product.name}
        </p>
        <p className="text-[11px] text-gray-400">{getUnitPriceLabel(product)}</p>
        <div className="mt-auto pt-1">
          <PriceTag price={displayPrice} mrp={product.mrp} />
        </div>
      </div>
    </Link>
  );
}
