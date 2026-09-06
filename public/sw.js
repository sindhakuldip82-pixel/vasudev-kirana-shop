self.addEventListener('push', function (event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: '🔔 New Order', body: event.data ? event.data.text() : 'A new order was received.' };
  }

  const title = data.title || '🔔 New Order — Vasudev Kirana Shop';
  const options = {
    body: data.body || 'A new order has arrived.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'vks-new-order',
    renotify: true,
    requireInteraction: true,
    data: { url: data.url || '/admin/orders', orderId: data.orderId || '' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
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
