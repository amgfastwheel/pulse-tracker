const CACHE = 'pulse-v2';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(['./', './index.html', './dashboard.html', './manifest.webmanifest', './icon.png'])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first: always show the latest version when online, fall back to cache offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
