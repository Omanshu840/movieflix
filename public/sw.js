/**
 * MovieFlix Service Worker
 * Provides offline support, caching, and PWA capabilities
 */

const CACHE_NAME = 'movieflix-v1';
const STATIC_CACHE = 'movieflix-static-v1';
const DYNAMIC_CACHE = 'movieflix-dynamic-v1';
const API_CACHE = 'movieflix-api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.jpg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== API_CACHE
          ) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  if (url.hostname.includes('tmdb-proxy.tmdb-proxy-movieflix.workers.dev')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Handle API requests
  if (url.pathname.includes('/api/') || 
      url.hostname.includes('api.themoviedb.org') ||
      url.hostname.includes('vidking.com')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle HTML requests
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle image requests
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle CSS and JS
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Default strategy
  event.respondWith(networkFirstStrategy(request));
});


async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);

  const now = Date.now();
  const ttl = getApiTTL();

  // If cache exists → return immediately
  if (cachedResponse) {
    // Revalidate in background if stale
    const cachedTime = cachedResponse.headers.get('sw-cache-time');
    const age = cachedTime ? now - Number(cachedTime) : Infinity;

    if (age > ttl) {
      // Background refresh (does NOT block UI)
      self.registration.sync
        ? self.registration.sync.register('swr-refresh')
        : refreshCache(request);
    }

    return cachedResponse;
  }

  // No cache → fetch normally
  const networkResponse = await fetchAndCache(request);
  return networkResponse;
}

async function fetchAndCache(request) {
  const cache = await caches.open(API_CACHE);
  const response = await fetch(request);

  if (response && response.status === 200) {
    const headers = new Headers(response.headers);
    headers.set('sw-cache-time', Date.now().toString());

    const cachedResponse = new Response(await response.clone().blob(), {
      status: response.status,
      statusText: response.statusText,
      headers
    });

    await cache.put(request, cachedResponse);
  }

  return response;
}

async function refreshCache(request) {
  try {
    await fetchAndCache(request);
  } catch (err) {
    // Silent failure (offline, etc.)
  }
}

function getApiTTL() {
  return 24 * 60 * 60 * 1000;
}


/**
 * Network First Strategy
 * Try network first, fall back to cache
 */
function networkFirstStrategy(request) {
  return fetch(request)
    .then((response) => {
      // Check if response is valid
      if (!response || response.status !== 200 || response.type === 'error') {
        return response;
      }

      // Clone the response
      const responseToCache = response.clone();
      const cacheName = request.destination === 'image' ? DYNAMIC_CACHE : API_CACHE;

      caches.open(cacheName).then((cache) => {
        cache.put(request, responseToCache);
      });

      return response;
    })
    .catch(() => {
      return caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          // Return offline page if available
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
          return null;
        });
    });
}

/**
 * Cache First Strategy
 * Try cache first, fall back to network
 */
function cacheFirstStrategy(request) {
  return caches.match(request)
    .then((response) => {
      if (response) {
        return response;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Return a placeholder for failed images
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect fill="#333" width="200" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="14">Image unavailable</text></svg>',
              {
                headers: { 'Content-Type': 'image/svg+xml' },
                status: 200
              }
            );
          }
          return null;
        });
    });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  if (event.tag === 'sync-watchlist') {
    event.waitUntil(syncWatchlist());
  }
});

async function syncWatchlist() {
  try {
    // Sync pending watchlist changes
    const db = await openDB();
    const pendingChanges = await getAllFromStore(db, 'pendingWatchlist');
    
    for (const change of pendingChanges) {
      await fetch('/api/watchlist', {
        method: 'POST',
        body: JSON.stringify(change),
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await clearStore(db, 'pendingWatchlist');
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New content available!',
    icon: '/favicon.jpg',
    badge: '/favicon.jpg',
    tag: 'movieflix-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('MovieFlix', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if available
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(DYNAMIC_CACHE).then(() => {
      caches.delete(API_CACHE).then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
    });
  }
});

console.log('[ServiceWorker] Loaded');
