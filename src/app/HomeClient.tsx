'use client';

import Link from 'next/link';
import { Category, Product, ShopSettings } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryChip } from '@/components/CategoryChip';
import ProductCard from '@/components/ProductCard';
import { buildWhatsAppLink } from '@/lib/whatsapp';

interface Props {
  categories: Category[];
  featured: Product[];
  offers: Product[];
  shopSettings: ShopSettings;
  isShopOpen: boolean;
  freeDeliveryAbove: number;
}

export default function HomeClient({
  categories,
  featured,
  offers,
  shopSettings,
  isShopOpen,
  freeDeliveryAbove,
}: Props) {
  const { t, lang } = useLanguage();

  const whatsappLink = buildWhatsAppLink(
    shopSettings.whatsappNumber,
    `Hi ${shopSettings.shopName}, I would like to place a grocery order.`
  );

  return (
    <div>
      {!isShopOpen && (
        <div className="bg-red-500 text-white text-center text-sm font-medium py-2 px-3">
          {t('shopClosed')}
        </div>
      )}

      {/* Hero */}
      <section className="px-4 pt-4 pb-5 bg-gradient-to-b from-brand-50 to-white">
        <p className="text-2xl font-bold text-gray-900 leading-tight">
          {t('shopTagline')}
        </p>
        <p className="text-sm text-gray-500 mt-1.5">
          {lang === 'gu' ? 'Your groceries, delivered to your doorstep.' : 'તમારો સામાન, હવે ઘરે બેઠા!'}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="text-xs bg-white border border-gray-200 rounded-full px-2.5 py-1">
            🚚 {t('homeDelivery')} in {shopSettings.village}
          </span>
          <span className="text-xs bg-white border border-gray-200 rounded-full px-2.5 py-1">
            ⚡ Fast local delivery
          </span>
          <span className="text-xs bg-white border border-gray-200 rounded-full px-2.5 py-1">
            🎁 Free delivery above ₹{freeDeliveryAbove}
          </span>
        </div>
        <div className="flex gap-2.5 mt-4">
          <Link
            href="/categories"
            className="flex-1 text-center bg-brand-500 text-white font-semibold text-sm py-3 rounded-xl active:bg-brand-600"
          >
            {t('shopNow')}
          </Link>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-[#25D366] text-white font-semibold text-sm py-3 rounded-xl active:opacity-90"
          >
            {t('orderOnWhatsApp')}
          </a>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">{t('categories')}</h2>
          <Link href="/categories" className="text-xs text-brand-600 font-medium">
            See all
          </Link>
        </div>
        <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((c) => (
            <CategoryChip key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* Today's offers */}
      {offers.length > 0 && (
        <section className="px-4 pt-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">{t('todaysOffers')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {offers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Popular products */}
      <section className="px-4 pt-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">{t('popularProducts')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 pt-8 pb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">{t('howItWorks')}</h2>
        <div className="grid grid-cols-1 gap-2.5">
          {[
            'Select products',
            'Choose quantity',
            'Enter location',
            'Place order',
            'We deliver',
          ].map((step, i) => (
            <div key={step} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-card">
              <span className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-gray-700">{step}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
