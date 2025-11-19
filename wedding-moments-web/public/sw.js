const CACHE_NAME = 'weddingmoments-v1'
const RUNTIME_CACHE = 'runtime-cache'

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/shop',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
]

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache')
      return cache.addAll(PRECACHE_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip Firebase requests (always fetch fresh)
  if (event.request.url.includes('firebaseapp.com') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('stripe.com')) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request).then((response) => {
        // Don't cache if not a success response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        // Cache GET requests only
        if (event.request.method === 'GET') {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }

        return response
      }).catch((error) => {
        console.error('Fetch failed:', error)
        
        // Return offline page if available
        return caches.match('/offline.html').then((offlinePage) => {
          if (offlinePage) {
            return offlinePage
          }
          
          // Return a basic offline response
          return new Response(
            '<h1>オフラインです</h1><p>インターネット接続を確認してください。</p>',
            {
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          )
        })
      })
    })
  )
})

// Background sync for offline uploads (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-photos') {
    event.waitUntil(syncPhotos())
  }
})

async function syncPhotos() {
  try {
    // Implement photo sync logic here
    console.log('Syncing photos...')
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

// Push notifications (optional)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '新しい通知があります',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: '開く',
      },
      {
        action: 'close',
        title: '閉じる',
      },
    ],
  }

  event.waitUntil(
    self.registration.showNotification('WeddingMoments', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})
