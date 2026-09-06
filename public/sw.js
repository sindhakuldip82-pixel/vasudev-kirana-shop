self.addEventListener('push', function (event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: '🔔 New Order', body: event.data ? event.data.text() : 'A new order was received.' };
  }

  const title = data.title || '🔔 New Order — Vasudev Kirana Shop';
  const orderId = data.orderId || `push-${Date.now()}`;
  const options = {
    body: data.body || 'A new order has arrived.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: `vks-order-${orderId}`,
    renotify: true,
    silent: false,
    requireInteraction: true,
    timestamp: Date.now(),
    data: {
      url: data.url || '/admin/orders',
      orderId,
      orderNumber: data.orderNumber || '',
    },
  };

  event.waitUntil((async () => {
    const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const visibleAdmin = clientList.some((client) => {
      try {
        return new URL(client.url).pathname.startsWith('/admin') && client.visibilityState === 'visible';
      } catch (_) {
        return false;
      }
    });

    // If an admin tab is visible right now, let the page itself create the
    // notification (plus chime/voice) so we don't double-fire — one native
    // push banner AND one foreground alert for the same order. Otherwise
    // (phone locked / app closed / tab in background) show a normal
    // background push, which is the common Zomato-style case.
    if (visibleAdmin) {
      clientList.forEach((client) => client.postMessage({
        type: 'VKS_NEW_ORDER',
        orderId,
        orderNumber: data.orderNumber || '',
        title,
        body: options.body,
        url: options.data.url,
        message: `New order received. ${data.orderNumber || ''}. Total rupees ${data.total || ''}.`.trim(),
      }));
      return;
    }

    await self.registration.showNotification(title, options);
  })());
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/admin/orders', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client) {
            try { client.navigate(targetUrl); } catch (_) {}
          }
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    }),
  );
});

// Chrome/Android (and other browsers) can silently rotate or expire a push
// subscription in the background — e.g. after ~a few weeks, or if Chrome
// itself renews its underlying FCM token. Without this handler, the admin
// would silently stop receiving alerts until they noticed and manually
// clicked "Enable" again. We resubscribe automatically here and push the new
// endpoint to the server so alerts keep flowing without any user action.
self.addEventListener('pushsubscriptionchange', function (event) {
  event.waitUntil((async () => {
    try {
      const applicationServerKey =
        (event.oldSubscription && event.oldSubscription.options && event.oldSubscription.options.applicationServerKey) ||
        (event.newSubscription && event.newSubscription.options && event.newSubscription.options.applicationServerKey);

      let subscription = event.newSubscription;
      if (!subscription && applicationServerKey) {
        subscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }
      if (!subscription) return;

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(subscription.toJSON ? subscription.toJSON() : subscription),
      });
    } catch (_) {
      // Best effort — there's no UI available inside the service worker to
      // surface this failure. The admin's "Push subscription" diagnostic on
      // the dashboard will show as inactive next time they open it.
    }
  })());
});
