import { get, put } from '@vercel/blob';
import webpush from 'web-push';

const SUBSCRIPTIONS_PATH = 'app-data/push-subscriptions.json';

export type PushSubscriptionRecord = {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
  createdAt?: string;
  userAgent?: string;
};

type DeliverResult = {
  sent: number;
  removed: string[];
  reason?: 'not_configured' | 'no_subscribers';
};

function vapidConfigured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT,
  );
}

function storeConfigured() {
  return Boolean(process.env.DATA_STORE_ID);
}

function setupWebPush() {
  if (!vapidConfigured()) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  return true;
}

async function readSubscriptions(): Promise<PushSubscriptionRecord[]> {
  const storeId = process.env.DATA_STORE_ID;
  if (!storeId) return [];
  try {
    const result = await get(SUBSCRIPTIONS_PATH, {
      access: 'private',
      storeId,
      useCache: false,
    });
    if (!result) return [];
    const raw = await new Response(result.stream).text();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Reading push subscriptions failed:', error);
    return [];
  }
}

async function writeSubscriptions(subscriptions: PushSubscriptionRecord[]) {
  const storeId = process.env.DATA_STORE_ID;
  if (!storeId) throw new Error('DATA_STORE_ID is not configured');
  await put(SUBSCRIPTIONS_PATH, JSON.stringify(subscriptions, null, 2), {
    access: 'private',
    storeId,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

/** Save (or refresh) a device's push subscription. Keyed by endpoint, so
 * re-subscribing the same device never creates duplicate notification
 * targets, and every genuinely different device gets its own entry. */
export async function savePushSubscription(
  subscription: PushSubscriptionRecord,
  userAgent?: string,
) {
  const subscriptions = await readSubscriptions();
  const next = subscriptions.filter((item) => item.endpoint !== subscription.endpoint);
  next.push({
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime ?? null,
    keys: subscription.keys,
    createdAt: new Date().toISOString(),
    userAgent: userAgent?.slice(0, 200),
  });
  await writeSubscriptions(next);
}

export async function removePushSubscription(endpoint: string): Promise<boolean> {
  const subscriptions = await readSubscriptions();
  const next = subscriptions.filter((item) => item.endpoint !== endpoint);
  if (next.length !== subscriptions.length) {
    await writeSubscriptions(next);
    return true;
  }
  return false;
}

/** For the admin diagnostics panel: which devices are currently registered. */
export async function listPushSubscriptions() {
  const subscriptions = await readSubscriptions();
  return subscriptions.map((s) => ({
    endpointSuffix: s.endpoint.slice(-16),
    host: (() => {
      try {
        return new URL(s.endpoint).host;
      } catch {
        return 'unknown';
      }
    })(),
    createdAt: s.createdAt || null,
    userAgent: s.userAgent || null,
  }));
}

/** Server-side config health, safe to expose to the logged-in admin (no secrets). */
export function getPushConfigStatus() {
  return {
    vapidPublicKeyConfigured: Boolean(process.env.VAPID_PUBLIC_KEY),
    vapidPrivateKeyConfigured: Boolean(process.env.VAPID_PRIVATE_KEY),
    vapidSubjectConfigured: Boolean(process.env.VAPID_SUBJECT),
    publicKeyExposedToClient: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
    dataStoreConfigured: storeConfigured(),
    ready: vapidConfigured() && storeConfigured(),
  };
}

async function deliver(subscriptions: PushSubscriptionRecord[], payload: string): Promise<DeliverResult> {
  const stale: string[] = [];
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, payload, { TTL: 60 * 60 });
        sent += 1;
      } catch (error: any) {
        const status = error?.statusCode;
        // 404/410 = the browser/OS has invalidated this subscription (e.g. the
        // user cleared site data, uninstalled Chrome, or the token expired).
        // Prune it so future sends don't keep failing against a dead endpoint.
        if (status === 404 || status === 410) {
          stale.push(subscription.endpoint);
        } else {
          console.error('Push notification failed:', status, error?.body || error?.message || error);
        }
      }
    }),
  );

  if (stale.length) {
    const current = await readSubscriptions();
    await writeSubscriptions(current.filter((s) => !stale.includes(s.endpoint)));
  }

  return { sent, removed: stale };
}

/** Fired once per newly-created order. Every call here is independent — there
 * is no shared "already notified" flag, so order N never blocks order N+1. */
export async function sendNewOrderNotification(order: {
  orderNumber: string;
  customerName: string;
  total: number;
  id: string;
}): Promise<DeliverResult> {
  if (!setupWebPush()) return { sent: 0, removed: [], reason: 'not_configured' };

  const subscriptions = await readSubscriptions();
  if (!subscriptions.length) return { sent: 0, removed: [], reason: 'no_subscribers' };

  const payload = JSON.stringify({
    title: `🔔 New Order — ${order.orderNumber}`,
    body: `${order.customerName} • ₹${Math.round(order.total)}`,
    url: '/admin/orders',
    orderId: order.id,
    orderNumber: order.orderNumber,
    total: Math.round(order.total),
  });

  return deliver(subscriptions, payload);
}

/** Sends a real push to verify the pipeline end-to-end. If `endpoint` is
 * given, only that device is targeted (used by the "Test Order Alert"
 * button so it pings the device you're actually looking at). */
export async function sendTestNotification(endpoint?: string): Promise<DeliverResult> {
  if (!setupWebPush()) return { sent: 0, removed: [], reason: 'not_configured' };

  const all = await readSubscriptions();
  const targets = endpoint ? all.filter((s) => s.endpoint === endpoint) : all;
  if (!targets.length) return { sent: 0, removed: [], reason: 'no_subscribers' };

  const testId = `test-${Date.now()}`;
  const payload = JSON.stringify({
    title: '🔔 Test Alert — Vasudev Kirana Shop',
    body: 'This is a test order alert. Your notifications are working ✅',
    url: '/admin/orders',
    orderId: testId,
    orderNumber: 'TEST',
    total: 0,
  });

  return deliver(targets, payload);
}
