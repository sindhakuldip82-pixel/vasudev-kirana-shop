'use client';

import { useEffect, useRef, useState } from 'react';

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

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

type SwStatus = 'checking' | 'unsupported' | 'registered' | 'error';
type PermissionState = NotificationPermission | 'unsupported';

type Diagnostics = {
  permission: PermissionState;
  swStatus: SwStatus;
  subscribed: boolean;
  serverReady: boolean | null;
  subscriptionCount: number | null;
};

export default function OrderAlerts() {
  const [diag, setDiag] = useState<Diagnostics>({
    permission: 'default',
    swStatus: 'checking',
    subscribed: false,
    serverReady: null,
    subscriptionCount: null,
  });
  const [busy, setBusy] = useState<'enable' | 'disable' | 'test' | null>(null);
  const [status, setStatus] = useState('');
  const alertedOrders = useRef<Set<string>>(new Set());
  const currentEndpoint = useRef<string | null>(null);

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
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.message || 'New order received.'));
    } catch (_) {}
  }

  async function refreshDiagnostics() {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    if (!supported) {
      setDiag((d) => ({ ...d, swStatus: 'unsupported', permission: 'unsupported' }));
      return;
    }

    let subscribed = false;
    let swStatus: SwStatus = 'checking';
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      swStatus = 'registered';
      const sub = await registration.pushManager.getSubscription();
      subscribed = Boolean(sub);
      currentEndpoint.current = sub?.endpoint || null;
    } catch (error) {
      console.error(error);
      swStatus = 'error';
    }

    setDiag((d) => ({ ...d, swStatus, subscribed, permission: Notification.permission }));

    try {
      const res = await fetch('/api/push/status');
      if (res.ok) {
        const data = await res.json();
        setDiag((d) => ({
          ...d,
          serverReady: Boolean(data?.config?.ready),
          subscriptionCount: typeof data?.subscriptionCount === 'number' ? data.subscriptionCount : null,
        }));
      }
    } catch (_) {}
  }

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    refreshDiagnostics();

    const onMessage = (event: MessageEvent) => {
      const data = event.data || {};
      if (data.type !== 'VKS_NEW_ORDER') return;
      announce(data);
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function enableAlerts() {
    setBusy('enable');
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        setStatus('This phone/browser does not support push notifications.');
        return;
      }
      if (!PUBLIC_VAPID_KEY) {
        setStatus('Notification setup is incomplete on the server (missing VAPID public key).');
        return;
      }

      setStatus('Enabling...');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('Please allow notifications in Chrome.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
        });
      }

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!res.ok) throw new Error('save failed');

      currentEndpoint.current = subscription.endpoint;
      setStatus('Order alerts are ON 🔔');
      await refreshDiagnostics();
    } catch (error) {
      console.error(error);
      setStatus('Could not enable alerts. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  async function disableAlerts() {
    setBusy('disable');
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        });
      }
      currentEndpoint.current = null;
      setStatus('Order alerts turned off.');
      await refreshDiagnostics();
    } catch (error) {
      console.error(error);
      setStatus('Could not disable alerts.');
    } finally {
      setBusy(null);
    }
  }

  async function sendTest() {
    setBusy('test');
    setStatus('Sending test alert...');
    try {
      const res = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: currentEndpoint.current || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || 'Test alert failed.');
        return;
      }
      setStatus(`Test alert sent (${data.sent} device${data.sent === 1 ? '' : 's'}). Check your notification tray.`);
    } catch (error) {
      console.error(error);
      setStatus('Could not send test alert.');
    } finally {
      setBusy(null);
    }
  }

  const rows: { label: string; ok: boolean | null; okText: string; badText: string }[] = [
    {
      label: 'Notification permission',
      ok:
        diag.permission === 'granted'
          ? true
          : diag.permission === 'denied'
          ? false
          : null,
      okText: 'Granted',
      badText:
        diag.permission === 'denied'
          ? 'Denied — enable in Chrome site settings'
          : diag.permission === 'unsupported'
          ? 'Not supported on this browser'
          : 'Not requested yet',
    },
    {
      label: 'Service worker',
      ok: diag.swStatus === 'registered' ? true : diag.swStatus === 'error' ? false : null,
      okText: 'Registered',
      badText:
        diag.swStatus === 'error'
          ? 'Registration failed'
          : diag.swStatus === 'unsupported'
          ? 'Not supported on this browser'
          : 'Checking...',
    },
    {
      label: 'Push subscription',
      ok: diag.subscribed,
      okText: 'Active on this device',
      badText: 'Not subscribed on this device',
    },
    {
      label: 'Server VAPID config',
      ok: diag.serverReady,
      okText: 'Configured',
      badText: diag.serverReady === null ? 'Checking...' : 'Missing VAPID/Blob env vars on server',
    },
  ];

  return (
    <div className="mb-5 rounded-2xl border border-brand-100 bg-brand-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-900">🔔 New Order Alerts</p>
          <p className="text-xs text-gray-600 mt-1">One push notification for every new order.</p>
        </div>
        {diag.subscribed ? (
          <button
            onClick={disableAlerts}
            disabled={busy !== null}
            className="shrink-0 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-60"
          >
            {busy === 'disable' ? '...' : 'Turn Off'}
          </button>
        ) : (
          <button
            onClick={enableAlerts}
            disabled={busy !== null}
            className="shrink-0 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy === 'enable' ? 'Enabling...' : 'Enable'}
          </button>
        )}
      </div>

      {status && <p className="mt-2 text-xs font-medium text-brand-700">{status}</p>}

      {diag.subscribed && (
        <button
          onClick={sendTest}
          disabled={busy !== null}
          className="mt-3 w-full rounded-xl border border-brand-300 bg-white px-4 py-2 text-xs font-semibold text-brand-700 disabled:opacity-60"
        >
          {busy === 'test' ? 'Sending...' : '🔔 Send Test Order Alert'}
        </button>
      )}

      <div className="mt-3 rounded-xl bg-white/70 p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">Diagnostics</p>
        <div className="flex flex-col gap-1.5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-xs gap-2">
              <span className="text-gray-600">{row.label}</span>
              <span
                className={
                  row.ok === true
                    ? 'font-semibold text-green-600 text-right'
                    : row.ok === false
                    ? 'font-semibold text-red-600 text-right'
                    : 'font-medium text-gray-400 text-right'
                }
              >
                {row.ok === true ? `✅ ${row.okText}` : row.ok === false ? `⚠️ ${row.badText}` : row.badText}
              </span>
            </div>
          ))}
          {diag.subscriptionCount !== null && (
            <div className="flex items-center justify-between text-xs pt-1.5 mt-0.5 border-t border-gray-100">
              <span className="text-gray-600">Registered devices</span>
              <span className="font-semibold text-gray-800">{diag.subscriptionCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
