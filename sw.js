const CACHE_NAME = 'regionais-pwa-v1';
const CACHE_PREFIX = 'regionais-pwa-';
const APP_ROOT = new URL('./', self.registration.scope);
const APP_FILES = [
  '/REGIONAIS/',
  '/REGIONAIS/index.html',
  '/REGIONAIS/manifest.json',
  '/REGIONAIS/icon/icon-192.png',
  '/REGIONAIS/icon/icon-512.png'
].map(path => new URL(path, APP_ROOT).href);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(cacheName => cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (!response.ok && response.type !== 'opaque') return response;

        return caches.open(CACHE_NAME)
          .then(cache => cache.put(request, response.clone()))
          .then(() => response);
      })
      .catch(() => caches.match(request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        if (request.mode === 'navigate') {
          return caches.match(new URL('./index.html', APP_ROOT).href);
        }
        return Response.error();
      }))
  );
});
