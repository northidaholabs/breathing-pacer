// Keeps the pacer working with no network after the first visit.
// Network first, so an update shows up when online; cache when offline.
const CACHE = 'breathing-pacer-v7';
const FILES = ['./', 'index.html', 'styles.css', 'app.js', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png',
  'manifest.webmanifest', 'pages.css', 'guide.html', 'card.html', 'privacy.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
