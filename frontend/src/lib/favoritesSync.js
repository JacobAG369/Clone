/**
 * @file src/lib/favoritesSync.js
 * @description Orquestador de sincronización remota para favoritos offline en Tu-Turismo PWA.
 *
 * Combina dos estrategias complementarias:
 *  1. Background Sync API (`SyncManager`) registrada en el Service Worker (`sync-tuturismo-favorites`).
 *  2. Fallback reactivo en cliente al evento `online` para navegadores sin `SyncManager` (Safari/Firefox).
 */

import api from './axios';
import { favoritesApi } from '../api/favorites';
import {
  deleteFavoriteFromDb,
  getAllFavoritesFromDb,
  getPendingSyncQueue,
  removeSyncQueueItem,
  saveFavoriteToDb,
  saveSwSyncConfig,
} from './favoritesDb';

export const FAVORITES_SYNC_TAG = 'sync-tuturismo-favorites';

let isFlushingQueue = false;

/** Sincroniza en `sw_meta` la URL base del API y el token activo para uso del Service Worker. */
export async function syncSwSessionMeta(tokenOverride) {
  const token = tokenOverride !== undefined ? tokenOverride : safeReadToken();
  const apiBaseUrl = api.defaults.baseURL || 'http://localhost:8000/api/v1';
  await saveSwSyncConfig({ apiBaseUrl, authToken: token });
}

function safeReadToken() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  } catch {
    return null;
  }
}

/**
 * Registra una tarea de sincronización diferida en el Service Worker mediante Background Sync API.
 * El navegador ejecutará el evento `sync` en `sw.js` automáticamente al recuperar conectividad.
 */
export async function registerFavoritesBackgroundSync() {
  await syncSwSessionMeta();

  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return { supported: false, registered: false };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if ('sync' in registration && registration.sync) {
      await registration.sync.register(FAVORITES_SYNC_TAG);
      return { supported: true, registered: true };
    }
    return { supported: false, registered: false };
  } catch (error) {
    console.warn('[PWA Sync] No se pudo registrar Background Sync:', error?.message);
    return { supported: false, registered: false };
  }
}

/** Procesa una operación individual de la cola contra el backend Django REST. */
async function processSingleQueueItem(item, localMap) {
  if (item.action === 'ADD_FAVORITE') {
    await favoritesApi.addFavorite({
      id: item.referencia_id,
      tipo: item.tipo,
    });
    const existing = localMap.get(item.referencia_id) || {
      referencia_id: item.referencia_id,
      tipo: item.tipo,
    };
    await saveFavoriteToDb(existing, 'synced');
    await removeSyncQueueItem(item.id);
    return true;
  }

  if (item.action === 'REMOVE_FAVORITE') {
    try {
      await favoritesApi.removeFavorite(item.referencia_id);
    } catch (err) {
      if (err?.response?.status !== 404) throw err;
    }
    await deleteFavoriteFromDb(item.referencia_id);
    await removeSyncQueueItem(item.id);
    return true;
  }

  await removeSyncQueueItem(item.id);
  return false;
}

/**
 * Vacía desde el cliente la cola `sync_queue` cuando vuelve la conexión a internet.
 * Actúa como respaldo para navegadores sin `SyncManager` o reconexiones con la app abierta.
 */
export async function flushFavoritesSyncQueueClient() {
  if (isFlushingQueue) return { syncedCount: 0 };
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { syncedCount: 0 };
  if (!safeReadToken()) return { syncedCount: 0 };

  isFlushingQueue = true;
  let syncedCount = 0;

  try {
    const queue = await getPendingSyncQueue();
    if (queue.length === 0) return { syncedCount: 0 };

    const allLocal = await getAllFavoritesFromDb({ includePendingRemove: true });
    const localMap = new Map(allLocal.map((f) => [f.referencia_id, f]));

    for (const item of queue) {
      try {
        const ok = await processSingleQueueItem(item, localMap);
        if (ok) syncedCount += 1;
      } catch (err) {
        if (!navigator.onLine || err?.code === 'ERR_NETWORK') break;
        console.warn('[PWA Sync] Error al sincronizar favorito pendiente:', err?.message);
      }
    }

    return { syncedCount };
  } finally {
    isFlushingQueue = false;
  }
}

/** Escucha notificaciones `FAVORITES_SYNCED` enviadas por el Service Worker tras Background Sync. */
export function subscribeToSwSyncMessages(onSynced) {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  const handler = (event) => {
    if (event.data?.type === 'FAVORITES_SYNCED') {
      onSynced?.(event.data);
    }
  };

  navigator.serviceWorker.addEventListener('message', handler);
  return () => navigator.serviceWorker.removeEventListener('message', handler);
}

