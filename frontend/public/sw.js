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

const APP_VERSION        = 'tuturismo-v7';
const SHELL_CACHE        = `${APP_VERSION}-shell`;
const RUNTIME_CACHE      = `${APP_VERSION}-runtime`;
const FAVORITES_SYNC_TAG = 'sync-tuturismo-favorites';
const IDB_NAME           = 'TuTurismoDB';
const IDB_VERSION        = 1;

// Activos del App Shell que se precachean en el install
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
  '/favicon.ico',
];

// ─────────────────────────────────────────────
// INSTALL — precachear App Shell de forma resiliente
// ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      await Promise.allSettled(
        APP_SHELL_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn('[SW] No se pudo precachear:', asset, err);
          })
        )
      );
    }).then(() => {
      // Forzar activación inmediata
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

  // Ignoramos esquemas no-http
  if (!url.protocol.startsWith('http')) return;

  // Ignorar herramientas de desarrollo de Vite
  if (url.pathname.includes('@vite') || url.pathname.includes('@react-refresh') || url.pathname.includes('__vite_ping')) {
    return;
  }

  // ── 1. Llamadas a la API de Django → Network-First ──────────────────────
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, RUNTIME_CACHE));
    return;
  }

  // ── 2. Navegación SPA y HTML (/, /index.html, /map, etc.) → Network-First
  //    SIEMPRE busca la versión más reciente en la red para evitar chunks desactualizados;
  //    si no hay internet (offline), usa la versión cacheada de /index.html.
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', clone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html', { cacheName: SHELL_CACHE }))
    );
    return;
  }

  // ── 3. Activos estáticos del App Shell (manifiesto, iconos) → Stale-While-Revalidate
  if (APP_SHELL_ASSETS.includes(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    return;
  }

  // ── 4. Activos con hash de Vite (JS, CSS) → Cache-First con fallback a red
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf)$/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(cacheFirstWithNetworkFallback(request, RUNTIME_CACHE));
    return;
  }

  // ── 5. Imágenes (locales y remotas) → Stale-While-Revalidate
  if (url.pathname.match(/\.(png|jpg|jpeg|webp|gif|svg|ico)$/)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
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

// ─────────────────────────────────────────────
// BACKGROUND SYNC API — Sincronización remota de Favoritos Offline
// ─────────────────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === FAVORITES_SYNC_TAG) {
    console.log('[SW Sync] Evento Background Sync disparado:', event.tag);
    event.waitUntil(syncPendingFavorites());
  }
});

/** Abre `TuTurismoDB` desde el hilo del Service Worker. */
function openIdbFromSw() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('favorites')) {
        const favStore = db.createObjectStore('favorites', { keyPath: 'referencia_id' });
        favStore.createIndex('by_tipo', 'tipo', { unique: false });
        favStore.createIndex('by_sync_status', 'sync_status', { unique: false });
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        const qStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        qStore.createIndex('by_referencia_id', 'referencia_id', { unique: false });
      }
      if (!db.objectStoreNames.contains('sw_meta')) {
        db.createObjectStore('sw_meta', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Lee `sync_config` y todos los elementos de `sync_queue` en una sola transacción. */
function readSwQueueAndConfig(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['sw_meta', 'sync_queue'], 'readonly');
    const configReq = tx.objectStore('sw_meta').get('sync_config');
    const queueReq = tx.objectStore('sync_queue').getAll();

    tx.oncomplete = () => resolve({
      config: configReq.result || null,
      queue: Array.isArray(queueReq.result) ? queueReq.result : [],
    });
    tx.onerror = () => reject(tx.error);
  });
}

/** Actualiza el estado local en `favorites` y elimina la tarea procesada de `sync_queue`. */
function markQueueItemCompleted(db, item) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['favorites', 'sync_queue'], 'readwrite');
    const favStore = tx.objectStore('favorites');
    const queueStore = tx.objectStore('sync_queue');

    if (item.action === 'REMOVE_FAVORITE') {
      favStore.delete(item.referencia_id);
    } else {
      const getReq = favStore.get(item.referencia_id);
      getReq.onsuccess = () => {
        if (getReq.result) {
          favStore.put({ ...getReq.result, sync_status: 'synced' });
        }
      };
    }

    queueStore.delete(item.id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Ejecuta la petición HTTP correspondiente contra `/api/v1/core/favorites/`. */
async function sendFavoriteRequestToServer(item, apiBaseUrl, authToken) {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${authToken}`,
  };

  if (item.action === 'ADD_FAVORITE') {
    const res = await fetch(`${apiBaseUrl}/core/favorites/`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: item.tipo, referencia_id: item.referencia_id }),
    });
    return res.ok;
  }

  if (item.action === 'REMOVE_FAVORITE') {
    const encodedId = encodeURIComponent(item.referencia_id);
    const res = await fetch(`${apiBaseUrl}/core/favorites/${encodedId}/`, {
      method: 'DELETE',
      headers,
    });
    return res.ok || res.status === 404;
  }

  return true;
}

/** Procesa la cola de favoritos pendientes y avisa a las pestañas activas al concluir. */
async function syncPendingFavorites() {
  const db = await openIdbFromSw();
  try {
    const { config, queue } = await readSwQueueAndConfig(db);
    if (queue.length === 0) return;
    if (!config?.authToken || !config?.apiBaseUrl) {
      console.warn('[SW Sync] Sin sesión activa; la cola se sincronizará al iniciar sesión.');
      return;
    }

    let syncedCount = 0;
    for (const item of queue) {
      const confirmed = await sendFavoriteRequestToServer(item, config.apiBaseUrl, config.authToken);
      if (confirmed) {
        await markQueueItemCompleted(db, item);
        syncedCount += 1;
      }
    }

    if (syncedCount > 0) {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach((client) => {
        client.postMessage({ type: 'FAVORITES_SYNCED', syncedCount });
      });
    }
  } finally {
    db.close();
  }
}
