'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import LocationPicker from '@/components/LocationPicker';
import { calculateDeliveryFee } from '@/lib/pricing';
import { isValidIndianMobile } from '@/lib/validation';
import { buildWhatsAppLink, buildWhatsAppMessage } from '@/lib/whatsapp';
import { DeliverySettings, ShopSettings } from '@/types';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { t } = useLanguage();
  const router = useRouter();

  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);
  const [shop, setShop] = useState<ShopSettings | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [village, setVillage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        setDelivery(d.deliverySettings);
        setShop(d.shopSettings);
        setVillage(d.shopSettings.village || '');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (items.length === 0 && !submitting) router.replace('/cart');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const deliveryFee = delivery ? calculateDeliveryFee(subtotal, delivery) : 0;
  const total = subtotal + deliveryFee;

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!customerName.trim()) next.customerName = 'Name is required';
    if (!isValidIndianMobile(phone)) next.phone = 'Enter a valid 10-digit mobile number';
    if (!village.trim()) next.village = 'Village is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function buildAddress() {
    return {
      houseNumber,
      streetArea,
      landmark,
      village,
      phone,
      latitude: coords?.lat,
      longitude: coords?.lng,
    };
  }

  async function submitOrder(orderedVia: 'WEBSITE' | 'WHATSAPP') {
    setSubmitError('');
    if (!validate()) return;
    if (delivery && !delivery.isShopOpen) {
      setSubmitError(t('shopClosed'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          address: buildAddress(),
          items,
          paymentMethod,
          deliveryInstructions: instructions,
          orderedVia,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(errorMessage(body.error));
        setSubmitting(false);
        return;
      }

      const { order } = await res.json();

      if (orderedVia === 'WHATSAPP' && shop) {
        const message = buildWhatsAppMessage({
          shopSettings: shop,
          customerName,
          address: buildAddress(),
          items,
          subtotal,
          deliveryFee,
          discount: 0,
          total,
        });
        const link = buildWhatsAppLink(shop.whatsappNumber, message);
        window.open(link, '_blank');
      }

      clearCart();
      router.push(`/order-confirmation/${order.id}`);
    } catch (e) {
      setSubmitError('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  }

  function errorMessage(code: string) {
    switch (code) {
      case 'shop_closed':
        return t('shopClosed');
      case 'invalid_phone':
        return 'Please enter a valid mobile number.';
      case 'empty_cart':
        return t('emptyCart');
      case 'out_of_stock':
        return 'One of the items in your cart just went out of stock. Please review your cart.';
      case 'product_unavailable':
        return 'One of the items in your cart is no longer available. Please review your cart.';
      case 'storage_unavailable':
        return 'Orders are temporarily unavailable. Please use WhatsApp or try again in a moment.';
      default:
        return 'Could not place your order. Please try again.';
    }
  }

  return (
    <div className="px-4 pt-4 pb-40">
      <h1 className="text-lg font-bold text-gray-900 mb-4">{t('placeOrder')}</h1>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500">{t('customerName')}</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
            placeholder="e.g. Ramesh Patel"
          />
          {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500">{t('mobileNumber')}</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            maxLength={10}
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
            placeholder="9876543210"
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        <LocationPicker onLocation={(lat, lng) => setCoords({ lat, lng })} />
        {coords && (
          <p className="text-xs text-brand-600 -mt-2">
            📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500">{t('houseNumber')}</label>
            <input
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">{t('village')}</label>
            <input
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
            />
            {errors.village && <p className="text-xs text-red-500 mt-1">{errors.village}</p>}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500">{t('streetArea')}</label>
          <input
            value={streetArea}
            onChange={(e) => setStreetArea(e.target.value)}
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500">{t('landmark')}</label>
          <input
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500">{t('deliveryInstructions')}</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{t('paymentMethod')}</label>
          <div className="flex gap-2">
            {(['COD', 'UPI'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 text-sm font-medium py-2.5 rounded-xl border ${
                  paymentMethod === method
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {method === 'COD' ? t('cashOnDelivery') : 'UPI'}
              </button>
            ))}
          </div>
          {paymentMethod === 'UPI' && (
            <p className="text-xs text-gray-400 mt-1.5">
              UPI QR code will be shared by the shop upon order confirmation. Online payment
              (Razorpay) can be enabled later — see the README.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{t('subtotal')}</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>{t('deliveryFee')}</span>
            <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
          </div>
          <div className="border-t border-dashed border-gray-200 my-2" />
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>{t('total')}</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2.5">{submitError}</div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-20 bg-white border-t border-gray-100 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="max-w-4xl mx-auto flex gap-2.5">
          <button
            onClick={() => submitOrder('WHATSAPP')}
            disabled={submitting}
            className="flex-1 bg-[#25D366] text-white font-semibold text-sm py-3.5 rounded-xl disabled:opacity-50"
          >
            {t('orderOnWhatsApp')}
          </button>
          <button
            onClick={() => submitOrder('WEBSITE')}
            disabled={submitting}
            className="flex-1 bg-brand-500 text-white font-semibold text-sm py-3.5 rounded-xl disabled:opacity-50"
          >
            {submitting ? '...' : t('placeOrder')}
          </button>
        </div>
      </div>
    </div>
  );
}
