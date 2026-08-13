/* FreshCart Admin — service worker.
 *
 * Strategy:
 *   navigations  → network-first, falling back to the cached app shell so the
 *                  dashboard opens offline (and from the home screen).
 *   same-origin  → stale-while-revalidate; Vite emits content-hashed asset
 *   assets         filenames, so a cached hit is always the right bytes.
 *   cross-origin → network only (the Google Fonts stylesheet is opaque to us
 *                  and the font files are cached by the browser anyway).
 */

const VERSION = 'v2'
const SHELL_CACHE = `freshcart-shell-${VERSION}`
const ASSET_CACHE = `freshcart-assets-${VERSION}`
const SHELL_URL = new URL('./index.html', self.registration.scope).pathname

// The alert clips are precached rather than left to stale-while-revalidate:
// a chime that only works once the asset has been fetched is a chime that
// misses the first order after an install.
const SHELL_FILES = [
  SHELL_URL,
  ...['manifest.webmanifest', 'sounds/order-sound.mp3', 'sounds/order-delivered.mp3'].map(
    (file) => new URL(`./${file}`, self.registration.scope).pathname,
  ),
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Only a real 200 for the deep-linked path is the app shell. A host
          // with no SPA catch-all rewrite (this is a client-routed app — every
          // path from react-router-dom must serve index.html) returns a plain
          // 404 for e.g. /products on direct load/refresh; caching THAT under
          // SHELL_URL would poison the offline shell with a dead page. Fall
          // back to the last-known-good cached shell instead, and only ever
          // update the cache from a genuinely successful response.
          if (!res.ok) throw new Error(`navigation fetch ${res.status}`)
          const copy = res.clone()
          caches.open(SHELL_CACHE).then((c) => c.put(SHELL_URL, copy))
          return res
        })
        .catch(() => caches.match(SHELL_URL).then((hit) => hit || Response.error())),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((hit) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone()
            caches.open(ASSET_CACHE).then((c) => c.put(request, copy))
          }
          return res
        })
        .catch(() => hit)

      return hit || network
    }),
  )
})
