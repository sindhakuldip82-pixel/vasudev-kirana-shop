'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShopSettings } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { MessageCircle, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';

export default function AccountPage() {
  const { t } = useLanguage();
  const [shop, setShop] = useState<ShopSettings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setShop(d.shopSettings))
      .catch(() => {});
  }, []);

  return (
    <div className="px-4 pt-4 pb-10">
      <h1 className="text-lg font-bold text-gray-900 mb-4">{t('account')}</h1>

      {shop && (
        <div className="bg-white rounded-2xl shadow-card p-4 flex flex-col gap-3">
          <div>
            <p className="font-bold text-gray-900">{shop.shopName}</p>
            {shop.shopNameGujarati && <p className="text-sm text-gray-400">{shop.shopNameGujarati}</p>}
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin size={15} className="mt-0.5 shrink-0" /> {shop.address}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={15} className="shrink-0" /> {shop.openingHours}
          </div>
          {shop.phoneNumber && shop.phoneNumber !== 'SHOP_PHONE_NUMBER' && (
            <a href={`tel:${shop.phoneNumber}`} className="flex items-center gap-2 text-sm text-brand-600">
              <Phone size={15} /> {shop.phoneNumber}
            </a>
          )}
          {shop.whatsappNumber && shop.whatsappNumber !== 'SHOP_WHATSAPP_NUMBER' && (
            <a
              href={buildWhatsAppLink(shop.whatsappNumber, `Hi ${shop.shopName}, I have a question.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#25D366] font-medium"
            >
              <MessageCircle size={15} /> Chat on WhatsApp
            </a>
          )}
        </div>
      )}

      <Link
        href="/admin/login"
        className="mt-4 flex items-center gap-2 text-xs text-gray-400 justify-center"
      >
        <ShieldCheck size={13} /> Shop owner? Admin login
      </Link>
    </div>
  );
}
