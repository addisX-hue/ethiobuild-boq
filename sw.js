const CACHE_NAME = 'addisboq-v18';
const ASSETS = [
  '/',
  '/index.html',
  '/sitelog.html',
  '/ethiopian-construction-guide',
  '/how-to-get-building-permit-in-ethiopia',
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

// Fetch — network-first: always try to get the freshest version from the
// server first. Only fall back to the cached copy if the network request
// fails (e.g. offline, or spotty connection) — this guarantees people
// always see the current live site when they have a connection, at the
// cost of a real network round-trip on every load.
self.addEventListener('fetch', event => {
  // Only handle GET requests. Non-GET requests (e.g. the TeleBirr payment
  // verification POST) can't be stored with cache.put() — attempting to
  // cache them throws — and shouldn't be served from cache anyway.
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
