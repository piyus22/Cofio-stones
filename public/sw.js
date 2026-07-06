// Cofio Stones service worker — offline support WITHOUT staleness.
//
// Strategy:
//  - Navigations (index.html): NETWORK-FIRST. Users always get the newest
//    version when online; the cached copy is only an offline fallback.
//  - Hashed build assets (/assets/*): CACHE-FIRST. Vite fingerprints these
//    filenames, so they are immutable — safe to cache forever.
//  - Everything else same-origin (icons, manifest): stale-while-revalidate.
const CACHE = 'cofio-v2'

self.addEventListener('install', () => {
  // Do NOT skipWaiting here — the app decides when to hand over (at launch),
  // so an update never reloads someone mid-exercise.
})

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin) return

  // 1) Navigations: network-first so updates arrive on the next visit
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
          return res
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match('./index.html'))
        )
    )
    return
  }

  // 2) Fingerprinted build assets: cache-first (immutable)
  if (url.pathname.includes('/assets/')) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(CACHE).then((c) => c.put(req, copy))
            }
            return res
          })
      )
    )
    return
  }

  // 3) Icons, manifest, etc.: stale-while-revalidate
  e.respondWith(
    caches.match(req).then((hit) => {
      const fetched = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(() => hit)
      return hit || fetched
    })
  )
})
