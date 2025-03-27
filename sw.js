// File: /sw.js
// Service Worker for the E-commerce PWA with fetch, sync, and push events

const CACHE_NAME = 'ecommerce-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/app.js',
  // Include additional static assets as needed
];

// Helper: network-first strategy for dynamic content (data.json)
function networkFirst(request) {
  return fetch(request)
    .then(networkResponse => {
      return caches.open(CACHE_NAME).then(cache => {
        cache.put(request, networkResponse.clone());
        return networkResponse;
      });
    })
    .catch(() => {
      return caches.match(request);
    });
}

// Installation: Cache app shell assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation: Clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: Intercept requests
self.addEventListener('fetch', event => {
  // For dynamic content (data.json), use network-first strategy
  if (event.request.url.includes('data.json')) {
    event.respondWith(networkFirst(event.request));
  } else {
    // Otherwise, use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});

// Sync event: Background synchronization example
// This tag could be used to sync products or other data when connectivity is restored
self.addEventListener('sync', event => {
  if (event.tag === 'syncProducts') {
    event.waitUntil(syncProducts());
  }
});

// Function that simulates syncing data (e.g., sending offline orders)
function syncProducts() {
  // Here you could fetch new data, send queued requests, etc.
  return fetch('/data.json')
    .then(response => {
      console.log('[Service Worker] Sync completed successfully.');
      // Optionally update the cache with the latest data
      return caches.open(CACHE_NAME).then(cache => {
        cache.put('/data.json', response.clone());
        return response;
      });
    })
    .catch(error => console.error('[Service Worker] Sync failed:', error));
}

// Push event: Handle incoming push notifications
self.addEventListener('push', event => {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  const title = data.title || "E-commerce PWA";
  const options = {
    body: data.body || "You have a new notification.",
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png'
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
