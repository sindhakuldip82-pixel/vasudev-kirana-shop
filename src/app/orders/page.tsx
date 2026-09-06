'use client';

import { useState } from 'react';
import { Order } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { isValidIndianMobile } from '@/lib/validation';

export default function OrdersPage() {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function lookup() {
    setError('');
    if (!isValidIndianMobile(phone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      setOrders(data.orders);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 pt-4 pb-10">
      <h1 className="text-lg font-bold text-gray-900 mb-4">{t('orders')}</h1>

      <div className="bg-white rounded-2xl shadow-card p-4 mb-5">
        <label className="text-xs font-semibold text-gray-500">{t('mobileNumber')}</label>
        <div className="flex gap-2 mt-1.5">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            maxLength={10}
            placeholder="9876543210"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
          />
          <button
            onClick={lookup}
            disabled={loading}
            className="bg-brand-500 text-white text-sm font-semibold px-4 rounded-xl disabled:opacity-50"
          >
            {loading ? '...' : 'View'}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      </div>

      {orders && (
        <div className="flex flex-col gap-2.5">
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No orders found for this number.</p>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl shadow-card p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-900">{o.orderNumber}</span>
                  <OrderStatusBadge status={o.status} />
                </div>
                <p className="text-xs text-gray-400 mb-1.5">
                  {new Date(o.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs text-gray-500 mb-1">
                  {o.items.map((i) => `${i.productName} (${i.quantityLabel})`).join(', ')}
                </p>
                <p className="text-sm font-bold text-gray-900">₹{o.total.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
