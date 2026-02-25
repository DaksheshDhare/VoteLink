// Service Worker for Offline Support
// Version 2.0.0 - Network-first strategy with cache-busting

const CACHE_NAME = 'votelink-v' + Date.now(); // Dynamic version based on timestamp
const OFFLINE_URL = '/offline.html';

// Assets to cache only after successful network fetch
const PRECACHE_ASSETS = [
  '/offline.html',
  '/models/face_expression_model-shard1',
  '/models/face_expression_model-weights_manifest.json',
  '/models/face_landmark_68_model-shard1',
  '/models/face_landmark_68_model-weights_manifest.json',
  '/models/face_recognition_model-shard1',
  '/models/face_recognition_model-shard2',
  '/models/face_recognition_model-weights_manifest.json',
  '/models/tiny_face_detector_model-shard1',
  '/models/tiny_face_detector_model-weights_manifest.json',
];

// Install event - skip precaching on install for network-first strategy
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  self.skipWaiting(); // Take over immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - NETWORK-FIRST strategy for always getting fresh content
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip POST requests and API calls - let them pass through always
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    // Try network first
    fetch(request)
      .then((response) => {
        // Only cache valid responses
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone the response before caching
        const responseToCache = response.clone();

        // Cache only non-HTML dynamic content (JS, CSS, images, fonts)
        const contentType = response.headers.get('content-type') || '';
        const shouldCache = 
          url.pathname.startsWith('/assets/') || // Vite assets with hashes
          contentType.includes('image') ||
          contentType.includes('font') ||
          contentType.includes('application/javascript') ||
          contentType.includes('text/css');

        if (shouldCache) {
          caches.open(CACHE_NAME)
            .then((cache) => {
              console.log('[ServiceWorker] Caching:', request.url);
              cache.put(request, responseToCache);
            });
        }

        return response;
      })
      .catch((error) => {
        console.error('[ServiceWorker] Network request failed:', request.url, error);
        
        // Try cache as fallback
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[ServiceWorker] Serving from cache (offline):', request.url);
              return cachedResponse;
            }

            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // Return a fallback response
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.payload;
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        event.ports[0].postMessage({ success: true });
      })
      .catch((error) => {
        console.error('[ServiceWorker] Failed to cache URLs:', error);
        event.ports[0].postMessage({ success: false, error: error.message });
      });
  }
});

// Background sync for offline vote submissions (future feature)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-votes') {
    event.waitUntil(syncVotes());
  }
});

async function syncVotes() {
  // Future implementation: sync pending votes when back online
  console.log('[ServiceWorker] Syncing pending votes...');
  
  try {
    // Get pending votes from IndexedDB
    // Send to server
    // Clear from IndexedDB on success
    return Promise.resolve();
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
    return Promise.reject(error);
  }
}

// Push notification support (future feature)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New voting notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('VoteLink', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
