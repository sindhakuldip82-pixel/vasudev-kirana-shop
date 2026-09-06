'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRequireAdmin } from '@/hooks';
import AdminNav from '@/components/AdminNav';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { Order, OrderStatus } from '@/types';
import { Phone, MapPin, Printer } from 'lucide-react';

const STATUSES: OrderStatus[] = ['NEW', 'ACCEPTED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const { checking, authed } = useRequireAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  function load() {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  async function changeStatus(order: Order, status: OrderStatus) {
    await fetch(`/api/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  }

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter !== 'ALL' && o.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q)
        );
      }
      return true;
    });
  }, [orders, filter, query]);

  if (checking || !authed) return null;

  return (
    <div>
      <AdminNav />
      <div className="max-w-3xl mx-auto px-4 py-5">
        <h1 className="text-lg font-bold text-gray-900 mb-4">Orders ({orders.length})</h1>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order #, name, or phone"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300 mb-3"
        />

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-4">
          {(['ALL', ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap border ${
                filter === s ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No orders match.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl shadow-card p-3.5">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{o.orderNumber}</p>
                    <p className="text-xs text-gray-400">
                      {o.customerName} · {new Date(o.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{o.total.toFixed(2)}</p>
                    <OrderStatusBadge status={o.status} />
                  </div>
                </div>

                {expanded === o.id && (
                  <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                      <Phone size={13} /> {o.phone}
                    </div>
                    <div className="flex items-start gap-1.5 text-sm text-gray-600 mb-2">
                      <MapPin size={13} className="mt-0.5" />
                      <span>
                        {[o.address.houseNumber, o.address.streetArea, o.address.landmark, o.address.village].filter(Boolean).join(', ')}
                        {o.address.latitude && o.address.longitude && (
                          <>
                            {' '}·{' '}
                            <a
                              href={`https://maps.google.com/?q=${o.address.latitude},${o.address.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-600 underline"
                            >
                              View on map
                            </a>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-2.5 mb-2.5">
                      {o.items.map((it, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-600 py-0.5">
                          <span>{it.productName} · {it.quantityLabel}{it.count > 1 ? ` x ${it.count}` : ''}</span>
                          <span>₹{it.calculatedPrice.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 mt-1.5 pt-1.5 flex justify-between text-xs font-semibold text-gray-800">
                        <span>Total (incl. ₹{o.deliveryFee.toFixed(2)} delivery)</span>
                        <span>₹{o.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {o.deliveryInstructions && (
                      <p className="text-xs text-gray-500 mb-2.5 italic">Note: {o.deliveryInstructions}</p>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={o.status}
                        onChange={(e) => changeStatus(o, e.target.value as OrderStatus)}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-300"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                      <button onClick={() => window.print()} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 shrink-0">
                        <Printer size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
