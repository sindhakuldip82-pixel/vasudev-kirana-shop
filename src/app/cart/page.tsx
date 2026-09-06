'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { calculateDeliveryFee } from '@/lib/pricing';
import { DeliverySettings } from '@/types';
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';

export default function CartPage() {
  const { items, updateCount, removeItem, subtotal } = useCart();
  const { t } = useLanguage();
  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setDelivery(d.deliverySettings))
      .catch(() => {});
  }, []);

  const deliveryFee = delivery ? calculateDeliveryFee(subtotal, delivery) : 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <ShoppingBag size={40} className="text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm mb-4">{t('emptyCart')}</p>
        <Link href="/categories" className="bg-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
          {t('shopNow')}
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-40">
      <h1 className="text-lg font-bold text-gray-900 mb-4">{t('cart')}</h1>
      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-card p-3 flex gap-3">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
              <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="64px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
              <p className="text-xs text-gray-400">{item.quantityLabel}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center border border-gray-200 rounded-full">
                  <button
                    onClick={() => updateCount(item.id, item.count - 1)}
                    className="w-7 h-7 flex items-center justify-center text-brand-600"
                    aria-label="Decrease"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.count}</span>
                  <button
                    onClick={() => updateCount(item.id, item.count + 1)}
                    className="w-7 h-7 flex items-center justify-center text-brand-600"
                    aria-label="Increase"
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <span className="text-sm font-bold text-gray-900">₹{item.lineTotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="text-gray-300 self-start"
              aria-label={t('remove')}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 bg-white rounded-2xl shadow-card p-4 flex flex-col gap-1.5">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{t('subtotal')}</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{t('deliveryFee')}</span>
          <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
        </div>
        <div className="border-t border-dashed border-gray-200 my-1.5" />
        <div className="flex justify-between text-base font-bold text-gray-900">
          <span>{t('total')}</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-20 bg-white border-t border-gray-100 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/checkout"
            className="block text-center bg-brand-500 text-white font-semibold text-sm py-3.5 rounded-xl"
          >
            {t('placeOrder')} · ₹{total.toFixed(2)}
          </Link>
        </div>
      </div>
    </div>
  );
}
