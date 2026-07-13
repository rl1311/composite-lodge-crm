/* Composite Lodge 4076 — service worker.
   Network-first for the app itself (so updates arrive), cache fallback offline.
   All network fetches bypass the browser HTTP cache ('no-cache' / 'reload') so a
   stale copy can never be re-cached — otherwise updates could lag indefinitely. */
const CACHE = 'lodge4076-v8';
const ASSETS = ['./', './index.html', './logo.jpg', './icon-192.png', './icon-512.png', './manifest.json', './sync-config.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ASSETS.map(u => new Request(u, {cache: 'reload'}))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) {}
  e.waitUntil(self.registration.showNotification(d.title || 'Composite Lodge No. 4076',
    { body: d.body || 'You have a new notification in the lodge app.',
      icon: './icon-192.png', badge: './icon-192.png' }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type: 'window'}).then(ws =>
    ws.length ? ws[0].focus() : clients.openWindow('./')));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // never intercept GitHub API calls
  e.respondWith(
    fetch(e.request, {cache: 'no-cache'}).then(r => {
      if (r.ok) {           // never cache an error response — a CDN hiccup must not stick
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }
      // on an error response, prefer a previously cached good copy
      return caches.match(e.request, {ignoreSearch: true}).then(hit => hit || r);
    }).catch(() => caches.match(e.request, {ignoreSearch: true}))
  );
});
