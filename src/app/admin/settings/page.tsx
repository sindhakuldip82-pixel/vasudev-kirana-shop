'use client';

import { useEffect, useState } from 'react';
import { useRequireAdmin } from '@/hooks';
import AdminNav from '@/components/AdminNav';
import { DeliverySettings, ShopSettings } from '@/types';

export default function AdminSettingsPage() {
  const { checking, authed } = useRequireAdmin();
  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);
  const [shop, setShop] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authed) return;
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        setDelivery(d.deliverySettings);
        setShop(d.shopSettings);
      })
      .finally(() => setLoading(false));
  }, [authed]);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliverySettings: delivery, shopSettings: shop }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (checking || !authed) return null;
  if (loading || !delivery || !shop) {
    return (
      <div>
        <AdminNav />
        <p className="text-sm text-gray-400 px-4 py-5">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <AdminNav />
      <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900 mb-4">Shop Settings</h1>
          <div className="bg-white rounded-2xl shadow-card p-4 flex flex-col gap-3">
            <Field label="Shop name" value={shop.shopName} onChange={(v) => setShop({ ...shop, shopName: v })} />
            <Field label="Shop name (Gujarati)" value={shop.shopNameGujarati || ''} onChange={(v) => setShop({ ...shop, shopNameGujarati: v })} />
            <Field label="Address" value={shop.address} onChange={(v) => setShop({ ...shop, address: v })} />
            <Field label="Village" value={shop.village} onChange={(v) => setShop({ ...shop, village: v })} />
            <Field
              label="WhatsApp number (digits only, e.g. 91XXXXXXXXXX)"
              value={shop.whatsappNumber}
              onChange={(v) => setShop({ ...shop, whatsappNumber: v })}
            />
            <Field label="Phone number" value={shop.phoneNumber} onChange={(v) => setShop({ ...shop, phoneNumber: v })} />
            <Field label="Opening hours" value={shop.openingHours} onChange={(v) => setShop({ ...shop, openingHours: v })} />
            <Field label="UPI ID (optional)" value={shop.upiId || ''} onChange={(v) => setShop({ ...shop, upiId: v })} />
            <Field label="Google Maps link (optional)" value={shop.googleMapsLink || ''} onChange={(v) => setShop({ ...shop, googleMapsLink: v })} />
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">Delivery Settings</h2>
          <div className="bg-white rounded-2xl shadow-card p-4 flex flex-col gap-3">
            <NumberField
              label="Free delivery above (₹)"
              value={delivery.freeDeliveryAboveAmount}
              onChange={(v) => setDelivery({ ...delivery, freeDeliveryAboveAmount: v })}
            />
            <NumberField
              label="Delivery fee below that amount (₹)"
              value={delivery.deliveryFeeBelowMinimum}
              onChange={(v) => setDelivery({ ...delivery, deliveryFeeBelowMinimum: v })}
            />
            <NumberField
              label="Minimum order amount (₹, 0 = no minimum)"
              value={delivery.minimumOrderAmount}
              onChange={(v) => setDelivery({ ...delivery, minimumOrderAmount: v })}
            />
            <NumberField
              label="Delivery radius (km)"
              value={delivery.deliveryRadiusKm}
              onChange={(v) => setDelivery({ ...delivery, deliveryRadiusKm: v })}
            />
            <NumberField
              label="Estimated delivery time (minutes)"
              value={delivery.estimatedDeliveryMinutes}
              onChange={(v) => setDelivery({ ...delivery, estimatedDeliveryMinutes: v })}
            />
            <label className="flex items-center gap-2 text-sm text-gray-700 mt-1">
              <input
                type="checkbox"
                checked={delivery.isShopOpen}
                onChange={(e) => setDelivery({ ...delivery, isShopOpen: e.target.checked })}
                className="w-4 h-4 accent-brand-500"
              />
              Shop is currently open (customers can place orders)
            </label>
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="bg-brand-500 text-white font-semibold text-sm py-3.5 rounded-xl disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
      />
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
      />
    </div>
  );
}
