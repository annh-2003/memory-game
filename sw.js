const CACHE_NAME = "memory-game-v14";

// Generate dino asset paths (43 PNG files from Flaticon)
const DINO_ASSETS = Array.from({ length: 43 }, (_, i) => {
  return `./assets/dino/dinosaur-${i + 1}.png`;
});

const ASSETS_TO_CACHE = [
  "./index.html",
  "./style.css",
  "./app.js",
  "./correct.mp3",
  "./error.mp3",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  ...DINO_ASSETS,
];

// Install: cache all static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache first, then network fallback
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Don't cache API calls (pokemon) — they change each game
        if (event.request.url.includes("pokeapi.co")) {
          return networkResponse;
        }
        // Cache other new requests
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});
