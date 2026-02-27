/// <reference lib="webworker" />

const CACHE_NAME = "klarinet-cache-v1";
const STATIC_CACHE_NAME = "klarinet-static-v1";

// Recursos estáticos que se cachean durante la instalación
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/apple-touch-icon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Instalación: cachear recursos estáticos esenciales
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activación: limpiar caches antiguas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (name) => name !== CACHE_NAME && name !== STATIC_CACHE_NAME
            )
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: estrategias de caché según el tipo de recurso
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones que no son GET
  if (request.method !== "GET") return;

  // Ignorar peticiones a Chrome extensions, etc.
  if (!url.protocol.startsWith("http")) return;

  // API calls (/api/*) y api.yhimsical.com → Network First
  if (url.pathname.startsWith("/api/") || url.hostname === "api.yhimsical.com") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Thumbnails de YouTube → Cache First (imágenes externas)
  if (url.hostname === "i.ytimg.com") {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // Next.js assets estáticos (_next/static) → Cache First
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
    return;
  }

  // Iconos y assets en /public → Cache First
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
    return;
  }

  // Pages y otros recursos → Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

/**
 * Cache First: busca en caché primero, si no está va a la red y lo cachea
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

/**
 * Network First: intenta la red, si falla usa el caché
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ status: "error", message: "Sin conexión" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Stale While Revalidate: sirve del caché mientras actualiza en segundo plano
 */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const cache = caches.open(CACHE_NAME);
        cache.then((c) => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => cached || new Response("Offline", { status: 503 }));

  return cached || fetchPromise;
}
