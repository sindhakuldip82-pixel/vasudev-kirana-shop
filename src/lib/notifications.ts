import { get, put } from '@vercel/blob';
import webpush from 'web-push';

const SUBSCRIPTIONS_PATH = 'app-data/push-subscriptions.json';

type PushSubscriptionRecord = {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
};

function configured() {
  return Boolean(
    process.env.DATA_STORE_ID &&
      process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT,
  );
}

function setupWebPush() {
  if (!configured()) return false;
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
  const result = await get(SUBSCRIPTIONS_PATH, {
    access: 'private',
    storeId,
    useCache: false,
  });
  if (!result) return [];
  const raw = await new Response(result.stream).text();
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
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

export async function savePushSubscription(subscription: PushSubscriptionRecord) {
  const subscriptions = await readSubscriptions();
  const next = subscriptions.filter((item) => item.endpoint !== subscription.endpoint);
  next.push(subscription);
  await writeSubscriptions(next);
}

export async function removePushSubscription(endpoint: string) {
  const subscriptions = await readSubscriptions();
  await writeSubscriptions(subscriptions.filter((item) => item.endpoint !== endpoint));
}

export async function sendNewOrderNotification(order: {
  orderNumber: string;
  customerName: string;
  total: number;
  id: string;
}) {
  if (!setupWebPush()) return;

  const subscriptions = await readSubscriptions();
  if (!subscriptions.length) return;

  const payload = JSON.stringify({
    title: '🔔 New Order — Vasudev Kirana Shop',
    body: `${order.orderNumber} • ${order.customerName} • ₹${order.total.toFixed(0)}`,
    url: `/admin/orders`,
    orderId: order.id,
  });

  const stale: string[] = [];
  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, payload, { TTL: 60 * 60 });
      } catch (error: any) {
        const status = error?.statusCode;
        if (status === 404 || status === 410) stale.push(subscription.endpoint);
        else console.error('Push notification failed:', error);
      }
    }),
  );

  if (stale.length) {
    await writeSubscriptions(subscriptions.filter((s) => !stale.includes(s.endpoint)));
  }
}
