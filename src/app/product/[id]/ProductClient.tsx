'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import QuantitySelector from '@/components/QuantitySelector';
import StockBadge from '@/components/StockBadge';
import { getUnitPriceLabel } from '@/lib/pricing';

export default function ProductClient({ product }: { product: Product }) {
  const { lang, t } = useLanguage();
  const { addItem } = useCart();
  const router = useRouter();

  const [selection, setSelection] = useState<{
    label: string;
    grams?: number;
    pieces?: number;
    variantId?: string;
    price: number;
  } | null>(null);

  const outOfStock = product.stockStatus === 'out_of_stock';

  function buildCartItem() {
    if (!selection) return null;
    return {
      productId: product.id,
      productName: product.name,
      productGujaratiName: product.gujaratiName,
      image: product.image,
      sellingType: product.sellingType,
      quantityLabel: selection.label,
      quantityValue: selection.grams ?? selection.pieces ?? 0,
      variantId: selection.variantId,
      unitPrice:
        product.sellingType === 'weight' || product.sellingType === 'volume'
          ? product.basePrice || 0
          : product.sellingType === 'piece'
          ? product.piecePrice || 0
          : selection.price,
      lineTotal: selection.price,
    };
  }

  function handleAddToCart() {
    const item = buildCartItem();
    if (!item || outOfStock) return;
    addItem(item);
  }

  function handleBuyNow() {
    const item = buildCartItem();
    if (!item || outOfStock) return;
    addItem(item);
    router.push('/cart');
  }

  return (
    <div className="pb-28">
      <div className="relative aspect-square bg-gray-50">
        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="100vw" />
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {lang === 'gu' && product.gujaratiName ? product.gujaratiName : product.name}
            </h1>
            {product.gujaratiName && (
              <p className="text-sm text-gray-400 mt-0.5">
                {lang === 'gu' ? product.name : product.gujaratiName}
              </p>
            )}
          </div>
          <StockBadge status={product.stockStatus} />
        </div>

        <p className="text-sm text-gray-400 mt-1">{getUnitPriceLabel(product)}</p>

        {product.description && (
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            {lang === 'gu' && product.descriptionGujarati ? product.descriptionGujarati : product.description}
          </p>
        )}

        <div className="mt-5 bg-white rounded-2xl p-4 shadow-card">
          {outOfStock ? (
            <p className="text-sm font-medium text-red-500">{t('outOfStock')}</p>
          ) : (
            <QuantitySelector product={product} onChange={setSelection} />
          )}
        </div>
      </div>

      {!outOfStock && (
        <div className="fixed bottom-16 left-0 right-0 z-20 bg-white border-t border-gray-100 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="max-w-4xl mx-auto flex gap-2.5">
            <button
              onClick={handleAddToCart}
              disabled={!selection}
              className="flex-1 border-2 border-brand-500 text-brand-600 font-semibold text-sm py-3 rounded-xl disabled:opacity-40"
            >
              {t('addToCart')}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!selection}
              className="flex-1 bg-brand-500 text-white font-semibold text-sm py-3 rounded-xl disabled:opacity-40"
            >
              {t('buyNow')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
