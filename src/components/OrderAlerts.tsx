'use client';

import { useEffect, useRef, useState } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (_) {}
}

export default function OrderAlerts() {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState('');
  const alertedOrders = useRef<Set<string>>(new Set());

  function announce(data: { orderId: string; title?: string; body?: string; message?: string }) {
    if (!data.orderId || alertedOrders.current.has(data.orderId)) return;
    alertedOrders.current.add(data.orderId);

    try {
      if (Notification.permission === 'granted') {
        new Notification(data.title || '🔔 New Order — Vasudev Kirana Shop', {
          body: data.body || 'A new order has arrived.',
          tag: `vks-order-${data.orderId}`,
          renotify: true,
          requireInteraction: true,
          icon: '/icons/icon-192.png',
          data: { url: '/admin/orders', orderId: data.orderId },
        });
      }
    } catch (_) {}

    playChime();
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(
        new SpeechSynthesisUtterance(data.message || 'New order received.'),
      );
    } catch (_) {}
  }

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    navigator.serviceWorker.register('/sw.js').catch(() => {});

    const onMessage = (event: MessageEvent) => {
      const data = event.data || {};
      if (data.type !== 'VKS_NEW_ORDER') return;
      announce(data);
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    if (Notification.permission === 'granted') setEnabled(true);

    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
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
          <p className="text-xs text-gray-600 mt-1">One alert for every new order.</p>
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
