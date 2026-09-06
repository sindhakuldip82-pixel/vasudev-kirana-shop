'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Order } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import OrderStatusBadge from '@/components/OrderStatusBadge';

export default function ConfirmationClient({ order }: { order: Order }) {
  const { t } = useLanguage();
  return (
    <div className="px-4 pt-8 pb-10 flex flex-col items-center text-center">
      <CheckCircle2 size={56} className="text-brand-500 mb-3" />
      <h1 className="text-xl font-bold text-gray-900">{t('orderPlaced')}</h1>
      <p className="text-sm text-gray-500 mt-1">
        {t('orderNumber')}: <span className="font-semibold text-gray-800">{order.orderNumber}</span>
      </p>

      <div className="w-full mt-6 bg-white rounded-2xl shadow-card p-4 text-left">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Status</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Customer</span>
          <span className="font-medium text-gray-900">{order.customerName}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Address</span>
          <span className="font-medium text-gray-900 text-right max-w-[60%]">
            {[order.address.houseNumber, order.address.streetArea, order.address.village]
              .filter(Boolean)
              .join(', ')}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{t('estimatedDelivery')}</span>
          <span className="font-medium text-gray-900">
            {order.estimatedDeliveryMinutes ? `${order.estimatedDeliveryMinutes} mins` : '—'}
          </span>
        </div>
        <div className="border-t border-dashed border-gray-200 my-2.5" />
        <div className="flex justify-between text-base font-bold text-gray-900">
          <span>{t('total')}</span>
          <span>₹{order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="w-full flex gap-2.5 mt-6">
        <Link
          href="/orders"
          className="flex-1 text-center border-2 border-brand-500 text-brand-600 font-semibold text-sm py-3 rounded-xl"
        >
          {t('orders')}
        </Link>
        <Link
          href="/"
          className="flex-1 text-center bg-brand-500 text-white font-semibold text-sm py-3 rounded-xl"
        >
          {t('home')}
        </Link>
      </div>
    </div>
  );
}
