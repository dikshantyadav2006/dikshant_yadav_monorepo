const CACHE_NAME = "portfolio-v2";
const MAX_ENTRIES = 60;
const ALLOWED_ORIGINS = [self.location.origin];

// Only cache same-origin GET requests with successful responses
function shouldCache(request, response) {
  if (request.method !== "GET") return false;
  if (!response || !response.ok) return false;
  if (response.type === "opaque") return false;

  const url = new URL(request.url);
  if (!ALLOWED_ORIGINS.includes(url.origin)) return false;

  // Skip HTML navigation requests (use network-first)
  if (response.headers.get("content-type")?.includes("text/html")) return false;

  return true;
}

// Evict oldest entries when cache exceeds limit
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}

self.addEventListener("install", (e) => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;

  // Skip non-GET, skip cross-origin
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOrigin = ALLOWED_ORIGINS.includes(url.origin);

  // HTML: network-first, fall back to cache
  if (request.headers.get("accept")?.includes("text/html")) {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Same-origin assets: cache-first
  if (isSameOrigin) {
    e.respondWith(
      caches.match(request).then((hit) => {
        if (hit) return hit;

        return fetch(request).then((res) => {
          if (shouldCache(request, res)) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => {
              c.put(request, copy);
              trimCache(CACHE_NAME, MAX_ENTRIES);
            });
          }
          return res;
        });
      })
    );
    return;
  }

  // Cross-origin (fonts, CDNs): network-only, never cache
  // Let browser handle its own caching via Cache-Control headers
});
