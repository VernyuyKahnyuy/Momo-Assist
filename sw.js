/* MoMo Desk service worker: shows a notification when a client request arrives, and opens the desk when tapped. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: 'New request', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      /* If the desk is open and on screen you already see the request, so stay quiet. */
      var seen = list.some(function (c) { return c.visibilityState === 'visible' && /agent\.html/.test(c.url); });
      if (seen) return;
      return self.registration.showNotification(d.title || 'New request', {
        body: d.body || '',
        tag: d.tag || 'momo-request',
        renotify: true,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        data: { url: d.url || 'agent.html' }
      });
    })
  );
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var target = new URL((e.notification.data && e.notification.data.url) || 'agent.html', self.registration.scope).href;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (/agent\.html/.test(list[i].url) && 'focus' in list[i]) return list[i].focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
