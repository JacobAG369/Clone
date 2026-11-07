/**
 * @file src/lib/favoritesDb.js
 * @description Capa nativa de persistencia asíncrona con IndexedDB para Tu-Turismo PWA.
 *
 * Estructura de `TuTurismoDB` (v1):
 *  - `favorites`  : Catálogo local estructurado de lugares, restaurantes y eventos favoritos.
 *  - `sync_queue` : Cola FIFO de mutaciones pendientes generadas sin conexión (offline).
 *  - `sw_meta`    : Metadatos de configuración para que el Service Worker sincronice en segundo plano.
 */

export const DB_NAME = 'TuTurismoDB';
export const DB_VERSION = 1;
export const STORES = {
  FAVORITES: 'favorites',
  SYNC_QUEUE: 'sync_queue',
  SW_META: 'sw_meta',
};
export const IDB_CHANGE_EVENT = 'tuturismo:idb-changed';

const VALID_ACTIONS = new Set(['ADD_FAVORITE', 'REMOVE_FAVORITE']);

// Respaldo en memoria para entornos de prueba sin IndexedDB nativo (ej. JSDOM/Node)
const memoryFallback = {
  favorites: new Map(),
  syncQueue: [],
  swMeta: new Map(),
  nextId: 1,
};

function hasIndexedDB() {
  return typeof indexedDB !== 'undefined';
}

function notifyIdbChanged() {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent(IDB_CHANGE_EVENT));
  }
}

/** Normaliza el tipo de recurso turístico a un valor válido del dominio. */
export function normalizeRecursoTipo(rawTipo = '') {
  const t = String(rawTipo || '').trim().toLowerCase();
  if (t.includes('restauran') || t.includes('comida') || t.includes('food')) return 'restaurante';
  if (t.includes('event')) return 'evento';
  return 'lugar';
}

/** Valida y construye el documento canónico que se almacena en IndexedDB. */
export function buildFavoriteRecord(resource = {}, syncStatus = 'local_only') {
  const rawId = resource.referencia_id || resource.id || resource._id || resource.recurso?.id;
  const referenciaId = String(rawId || '').trim();
  if (!referenciaId) {
    throw new Error('El recurso debe contener un identificador válido.');
  }

  const base = resource.recurso || resource;
  const tipo = normalizeRecursoTipo(
    resource.tipo || resource.tipo_recurso || resource._collectionType || resource.categoria_normalizada
  );

  return {
    referencia_id: referenciaId,
    tipo,
    saved_at: resource.saved_at || resource.created_at || new Date().toISOString(),
    sync_status: syncStatus,
    recurso: {
      id: referenciaId,
      nombre: String(base.nombre || base.name || base.title || 'Destino en Jalisco').slice(0, 200),
      imagen: base.imagen_url || base.imagen || base.imagenes?.[0] || null,
      rating: typeof base.rating === 'number' ? base.rating : Number(base.rating_promedio) || null,
      municipio: String(base.municipio || base.ciudad || 'Jalisco').slice(0, 120),
      categoria: String(base.categoria || tipo).slice(0, 80),
      descripcion: String(base.descripcion || base.description || '').slice(0, 600),
      ubicacion: base.direccion || base.ubicacion || null,
      fecha: base.fecha_inicio || base.fecha || null,
    },
  };
}

/** Abre la conexión a `TuTurismoDB` e inicializa los Object Stores e índices. */
export function openFavoritesDb() {
  if (!hasIndexedDB()) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORES.FAVORITES)) {
        const favStore = db.createObjectStore(STORES.FAVORITES, { keyPath: 'referencia_id' });
        favStore.createIndex('by_tipo', 'tipo', { unique: false });
        favStore.createIndex('by_sync_status', 'sync_status', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const queueStore = db.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        queueStore.createIndex('by_referencia_id', 'referencia_id', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SW_META)) {
        db.createObjectStore(STORES.SW_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Obtiene todos los favoritos almacenados localmente en IndexedDB. */
export async function getAllFavoritesFromDb({ includePendingRemove = false } = {}) {
  const db = await openFavoritesDb();
  if (!db) {
    const all = Array.from(memoryFallback.favorites.values());
    return includePendingRemove ? all : all.filter((item) => item.sync_status !== 'pending_remove');
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FAVORITES, 'readonly');
    const req = tx.objectStore(STORES.FAVORITES).getAll();

    req.onsuccess = () => {
      const records = Array.isArray(req.result) ? req.result : [];
      const filtered = includePendingRemove
        ? records
        : records.filter((item) => item.sync_status !== 'pending_remove');
      filtered.sort((a, b) => String(b.saved_at).localeCompare(String(a.saved_at)));
      resolve(filtered);
    };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/** Guarda o actualiza un favorito en el Object Store `favorites`. */
export async function saveFavoriteToDb(resource, syncStatus = 'local_only') {
  const record = buildFavoriteRecord(resource, syncStatus);
  const db = await openFavoritesDb();

  if (!db) {
    memoryFallback.favorites.set(record.referencia_id, record);
    notifyIdbChanged();
    return record;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FAVORITES, 'readwrite');
    tx.objectStore(STORES.FAVORITES).put(record);
    tx.oncomplete = () => {
      db.close();
      notifyIdbChanged();
      resolve(record);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/** Elimina un favorito de IndexedDB por su `referencia_id`. */
export async function deleteFavoriteFromDb(referenciaId) {
  const id = String(referenciaId || '').trim();
  if (!id) return false;

  const db = await openFavoritesDb();
  if (!db) {
    const deleted = memoryFallback.favorites.delete(id);
    notifyIdbChanged();
    return deleted;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FAVORITES, 'readwrite');
    tx.objectStore(STORES.FAVORITES).delete(id);
    tx.oncomplete = () => {
      db.close();
      notifyIdbChanged();
      resolve(true);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/** Limpia por completo los favoritos con estado `local_only`. */
export async function clearLocalOnlyFavoritesFromDb() {
  const existing = await getAllFavoritesFromDb({ includePendingRemove: true });
  const localItems = existing.filter((item) => item.sync_status === 'local_only');
  await Promise.all(localItems.map((item) => deleteFavoriteFromDb(item.referencia_id)));
}

/** Espeja la lista del servidor en IndexedDB respetando operaciones offline pendientes. */
export async function mirrorServerFavoritesToDb(serverItems = []) {
  const existing = await getAllFavoritesFromDb({ includePendingRemove: true });
  const pendingMap = new Map(
    existing
      .filter((item) => item.sync_status !== 'synced')
      .map((item) => [item.referencia_id, item])
  );

  const db = await openFavoritesDb();
  if (!db) {
    for (const [id, item] of memoryFallback.favorites.entries()) {
      if (item.sync_status === 'synced') memoryFallback.favorites.delete(id);
    }
    serverItems.forEach((raw) => {
      const record = buildFavoriteRecord(raw, 'synced');
      if (!pendingMap.has(record.referencia_id)) {
        memoryFallback.favorites.set(record.referencia_id, record);
      }
    });
    return;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FAVORITES, 'readwrite');
    const store = tx.objectStore(STORES.FAVORITES);

    existing.forEach((item) => {
      if (item.sync_status === 'synced') store.delete(item.referencia_id);
    });

    serverItems.forEach((raw) => {
      const record = buildFavoriteRecord(raw, 'synced');
      if (!pendingMap.has(record.referencia_id)) {
        store.put(record);
      }
    });

    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/** Encola una operación offline en `sync_queue` deduplicando acciones previas sobre el mismo ID. */
export async function enqueueFavoriteSync({ action, referenciaId, tipo }) {
  const cleanId = String(referenciaId || '').trim();
  if (!cleanId || !VALID_ACTIONS.has(action)) {
    throw new Error('Operación de sincronización inválida.');
  }

  const entry = {
    action,
    referencia_id: cleanId,
    tipo: normalizeRecursoTipo(tipo),
    created_at: new Date().toISOString(),
  };

  const db = await openFavoritesDb();
  if (!db) {
    memoryFallback.syncQueue = memoryFallback.syncQueue.filter(
      (item) => item.referencia_id !== cleanId
    );
    const saved = { ...entry, id: memoryFallback.nextId++ };
    memoryFallback.syncQueue.push(saved);
    notifyIdbChanged();
    return saved;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.SYNC_QUEUE);
    const index = store.index('by_referencia_id');
    const prevReq = index.getAllKeys(cleanId);

    prevReq.onsuccess = () => {
      (prevReq.result || []).forEach((key) => store.delete(key));
      const addReq = store.add(entry);
      addReq.onsuccess = () => {
        entry.id = addReq.result;
      };
    };

    tx.oncomplete = () => {
      db.close();
      notifyIdbChanged();
      resolve(entry);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/** Devuelve todas las mutaciones pendientes de sincronizar en orden FIFO. */
export async function getPendingSyncQueue() {
  const db = await openFavoritesDb();
  if (!db) return [...memoryFallback.syncQueue];

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
    const req = tx.objectStore(STORES.SYNC_QUEUE).getAll();
    req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/** Elimina un elemento ya sincronizado de `sync_queue`. */
export async function removeSyncQueueItem(queueId) {
  const db = await openFavoritesDb();
  if (!db) {
    memoryFallback.syncQueue = memoryFallback.syncQueue.filter((item) => item.id !== queueId);
    notifyIdbChanged();
    return;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    tx.objectStore(STORES.SYNC_QUEUE).delete(queueId);
    tx.oncomplete = () => {
      db.close();
      notifyIdbChanged();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/** Guarda configuración de endpoint y sesión activa para que el SW ejecute Background Sync. */
export async function saveSwSyncConfig({ apiBaseUrl, authToken }) {
  const cleanUrl = String(apiBaseUrl || '').replace(/\/+$/, '');
  const payload = {
    key: 'sync_config',
    apiBaseUrl: cleanUrl,
    authToken: authToken ? String(authToken) : null,
    updatedAt: new Date().toISOString(),
  };

  const db = await openFavoritesDb();
  if (!db) {
    memoryFallback.swMeta.set('sync_config', payload);
    return;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SW_META, 'readwrite');
    tx.objectStore(STORES.SW_META).put(payload);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/** Elimina las credenciales almacenadas para el Service Worker al cerrar sesión. */
export async function clearSwSyncConfig() {
  const db = await openFavoritesDb();
  if (!db) {
    memoryFallback.swMeta.delete('sync_config');
    return;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SW_META, 'readwrite');
    tx.objectStore(STORES.SW_META).delete('sync_config');
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/** Utilidad exclusiva para pruebas unitarias en memoria. */
export function __resetMemoryFallbackForTests() {
  memoryFallback.favorites.clear();
  memoryFallback.syncQueue = [];
  memoryFallback.swMeta.clear();
  memoryFallback.nextId = 1;
}

