const CACHE_NAME = 'bulk-note-v1'

// Pages to pre-cache on install (app shell)
const PRECACHE_URLS = ['/']

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// ─── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

// ─── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET requests from the same origin
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // Skip API routes — always need live data
  if (url.pathname.startsWith('/api/')) return

  // Next.js static assets are content-hashed → cache-first (safe forever)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()))
          }
          return response
        })
      })
    )
    return
  }

  // All other requests (page navigations, assets):
  // Network-first → cache as fallback when offline
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()))
        }
        return response
      })
      .catch(() =>
        caches.match(request).then(cached => {
          if (cached) return cached
          // Last resort: serve the cached home page for navigation requests
          if (request.destination === 'document') {
            return caches.match('/')
          }
          return new Response('Offline', { status: 503 })
        })
      )
  )
})
