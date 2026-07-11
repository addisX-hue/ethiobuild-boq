const CACHE_NAME = 'addisboq-v9';
const ASSETS = [
  '/',
  '/index.html',
  '/icon-192.jpg',
  '/icon-512.jpg',
  '/manifest.json'
];

// Install — cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — stale-while-revalidate: serve cached copy instantly, quietly fetch
// a fresh copy in the background and save it for next time. Falls back to
// network if nothing's cached yet (e.g. first visit).
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const networkFetch = fetch(event.request).then(response => {
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => cached); // offline and nothing new — fall back to cache

        return cached || networkFetch;
      })
    )
  );
});
