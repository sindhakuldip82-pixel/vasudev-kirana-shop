'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAdmin } from '@/hooks';
import AdminNav from '@/components/AdminNav';
import { Order, Product } from '@/types';
import OrderAlerts from '@/components/OrderAlerts';

export default function AdminDashboardPage() {
  const { checking, authed } = useRequireAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authed) return;
    Promise.all([
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ])
      .then(([o, p]) => {
        setOrders(o.orders || []);
        setProducts(p.products || []);
      })
      .finally(() => setLoading(false));
  }, [authed]);

  if (checking || !authed) return null;

  const todayStr = new Date().toDateString();
  const todaysOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === todayStr);
  const todaysSales = todaysOrders.reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) => o.status === 'NEW' || o.status === 'ACCEPTED').length;
  const outForDelivery = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
  const delivered = orders.filter((o) => o.status === 'DELIVERED').length;

  const cards = [
    { label: "Today's Orders", value: todaysOrders.length },
    { label: "Today's Sales", value: `₹${todaysSales.toFixed(0)}` },
    { label: 'Pending Orders', value: pending },
    { label: 'Out for Delivery', value: outForDelivery },
    { label: 'Delivered', value: delivered },
    { label: 'Total Products', value: products.length },
  ];

  return (
    <div>
      <AdminNav />
      <div className="max-w-5xl mx-auto px-4 py-5">
        <h1 className="text-lg font-bold text-gray-900 mb-4">Dashboard</h1>
        <OrderAlerts />
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cards.map((c) => (
              <div key={c.label} className="bg-white rounded-2xl shadow-card p-4">
                <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                <p className="text-xs text-gray-500 mt-1">{c.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-2.5 flex-wrap">
          <Link href="/admin/products/new" className="bg-brand-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl">
            + Add Product
          </Link>
          <Link href="/admin/orders" className="border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl">
            View Orders
          </Link>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold text-gray-900 mb-2.5">Recent Orders</h2>
          <div className="flex flex-col gap-2">
            {orders.slice(0, 5).map((o) => (
              <Link
                key={o.id}
                href="/admin/orders"
                className="bg-white rounded-xl shadow-card p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{o.orderNumber}</p>
                  <p className="text-xs text-gray-400">{o.customerName}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">₹{o.total.toFixed(2)}</p>
              </Link>
            ))}
            {orders.length === 0 && <p className="text-sm text-gray-400">No orders yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
