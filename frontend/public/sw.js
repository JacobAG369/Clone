/**
 * Tu-Turismo — Service Worker
 * Estrategia: App Shell (Cache-First) + API (Network-First con fallback)
 *
 * Arquitectura:
 *  - APP_SHELL_CACHE : activos estáticos precacheados en el install event.
 *  - RUNTIME_CACHE   : activos dinámicos (imágenes, fuentes CDN) cacheados
 *                      la primera vez que se solicitan (stale-while-revalidate).
 *  - Las llamadas a la API de Django (/api/) usan Network-First: siempre
 *    intenta la red; si falla, devuelve la respuesta cacheada si existe.
 */

const APP_VERSION    = 'tuturismo-v4';
const SHELL_CACHE    = `${APP_VERSION}-shell`;
const RUNTIME_CACHE  = `${APP_VERSION}-runtime`;

// Activos del App Shell que se precachean en el install
// Nota: Vite genera hashes en los nombres de bundle; el / y el index.html
// son suficientes para garantizar la carga offline de la SPA.
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/favicon-48.png',
  '/favicon.svg',
];

// ─────────────────────────────────────────────
// INSTALL — precachear App Shell de forma resiliente
// ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      // Usamos Promise.allSettled para asegurar que la instalación nunca falle por un recurso individual
      await Promise.allSettled(
        APP_SHELL_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn('[SW] No se pudo precachear:', asset, err);
          })
        )
      );
    }).then(() => {
      // Activa inmediatamente sin esperar que cierren otras pestañas
      return self.skipWaiting();
    })
  );
});

// ─────────────────────────────────────────────
// ACTIVATE — limpiar cachés viejos
// ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const VALID_CACHES = [SHELL_CACHE, RUNTIME_CACHE];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !VALID_CACHES.includes(name))
          .map((name) => {
            console.log('[SW] Eliminando caché obsoleto:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ─────────────────────────────────────────────
// FETCH — lógica de caché por tipo de recurso
// ─────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptamos GET; ignoramos POST/PUT/DELETE
  if (request.method !== 'GET') return;

  // Ignoramos chrome-extension y otros esquemas no-http
  if (!url.protocol.startsWith('http')) return;

  // Ignorar herramientas de desarrollo de Vite (HMR, React Refresh) para no interferir en dev
  if (url.pathname.includes('@vite') || url.pathname.includes('@react-refresh') || url.pathname.includes('__vite_ping')) {
    return;
  }

  // ── 1. Llamadas a la API de Django → Network-First ──────────────────────
  if (url.pathname.startsWith('/api/') || url.hostname.includes('tuturismo')) {
    event.respondWith(networkFirstWithCache(request, RUNTIME_CACHE));
    return;
  }

  // ── 2. App Shell (/, /index.html, /manifest, /icons) → Cache-First ──────
  if (APP_SHELL_ASSETS.some((asset) => url.pathname === asset || url.pathname === '/')) {
    event.respondWith(cacheFirstWithNetworkFallback(request, SHELL_CACHE));
    return;
  }

  // ── 3. Activos de Vite (JS, CSS con hash) → Cache-First + Runtime ────────
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf)$/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(cacheFirstWithNetworkFallback(request, RUNTIME_CACHE));
    return;
  }

  // ── 4. Imágenes (locales y CDN externa) → Stale-While-Revalidate ─────────
  if (url.pathname.match(/\.(png|jpg|jpeg|webp|gif|svg|ico)$/)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // ── 5. Navegación SPA (cualquier ruta que no coincida arriba) ─────────────
  //    Devuelve /index.html para que React Router maneje el enrutado client-side
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html', { cacheName: SHELL_CACHE })
      )
    );
    return;
  }
});

// ─────────────────────────────────────────────
// Estrategias de caché
// ─────────────────────────────────────────────

/** Network-First: intenta red; si falla devuelve caché. */
async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response(
      JSON.stringify({ error: 'Sin conexión. Datos no disponibles offline.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/** Cache-First: devuelve caché si existe; si no, va a red y cachea. */
async function cacheFirstWithNetworkFallback(request, cacheName) {
  const cached = await caches.match(request, { cacheName });
  if (cached) return cached;

  try {
    const cache = await caches.open(cacheName);
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // Último recurso: devolver index.html para mantener la SPA en pie
    return caches.match('/index.html', { cacheName: SHELL_CACHE });
  }
}

/** Stale-While-Revalidate: devuelve caché inmediatamente y actualiza en background. */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Actualización en background (fire-and-forget)
  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached); // Si falla la red, no rompemos nada

  return cached || networkFetch;
}
