'use client';

import { useEffect, useRef, useState } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function OrderAlerts() {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState('');
  const lastOrderId = useRef<string | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});

    if (Notification.permission === 'granted') setEnabled(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkOrders() {
      try {
        const res = await fetch('/api/orders', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const orders = data.orders || [];
        if (!orders.length) return;

        const newest = orders[0];
        if (lastOrderId.current === null) {
          lastOrderId.current = newest.id;
          return;
        }

        if (newest.id !== lastOrderId.current) {
          lastOrderId.current = newest.id;
          const message = `New order received. ${newest.orderNumber}. Total rupees ${Math.round(newest.total)}.`;
          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const ctx = new AudioCtx();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.frequency.value = 880;
              gain.gain.value = 0.08;
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.25);
            }
          } catch (_) {}
          try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(message));
          } catch (_) {}
        }
      } catch (_) {}
    }

    if (!cancelled) checkOrders();
    const timer = window.setInterval(checkOrders, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  async function enableAlerts() {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        setStatus('This phone/browser does not support push notifications.');
        return;
      }

      setStatus('Enabling...');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('Please allow notifications in Chrome.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        setStatus('Notification setup is incomplete on the server.');
        return;
      }

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!res.ok) throw new Error('save failed');

      setEnabled(true);
      setStatus('Order alerts are ON 🔔');
    } catch (error) {
      console.error(error);
      setStatus('Could not enable alerts. Please try again.');
    }
  }

  return (
    <div className="mb-5 rounded-2xl border border-brand-100 bg-brand-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-900">🔔 New Order Alerts</p>
          <p className="text-xs text-gray-600 mt-1">Get a phone notification when a customer orders.</p>
        </div>
        <button
          onClick={enableAlerts}
          disabled={enabled}
          className="shrink-0 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {enabled ? 'ON ✓' : 'Enable'}
        </button>
      </div>
      {status && <p className="mt-2 text-xs font-medium text-brand-700">{status}</p>}
    </div>
  );
}
