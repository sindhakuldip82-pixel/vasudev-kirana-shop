self.addEventListener('push', function (event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: '🔔 New Order', body: event.data ? event.data.text() : 'A new order was received.' };
  }

  const title = data.title || '🔔 New Order — Vasudev Kirana Shop';
  const orderId = data.orderId || String(Date.now());
  const options = {
    body: data.body || 'A new order has arrived.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: `vks-order-${orderId}`,
    renotify: true,
    silent: false,
    requireInteraction: true,
    timestamp: Date.now(),
    data: { url: data.url || '/admin/orders', orderId },
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

    // If the admin page is currently visible, let the page create exactly one
    // notification + voice/chime. Otherwise show a normal background push.
    if (visibleAdmin) {
      clientList.forEach((client) => client.postMessage({
        type: 'VKS_NEW_ORDER',
        orderId,
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
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    }),
  );
});
