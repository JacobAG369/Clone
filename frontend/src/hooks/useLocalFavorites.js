/**
 * useLocalFavorites — hook de favoritos locales persistidos de forma asíncrona en IndexedDB.
 *
 * Diseño:
 *  - No requiere autenticación. Funciona 100% offline.
 *  - Persiste documentos estructurados del recurso en `TuTurismoDB` -> Object Store `favorites`.
 *  - Migra automáticamente cualquier dato previo almacenado en `localStorage` (`pwa_local_favorites`).
 *  - Compatible con el mismo shape que usa `useFavorites` (`referencia_id`, `tipo`, `recurso`).
 *  - Sincroniza estado reactivo entre componentes mediante el evento `IDB_CHANGE_EVENT`.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  buildFavoriteRecord,
  clearLocalOnlyFavoritesFromDb,
  deleteFavoriteFromDb,
  getAllFavoritesFromDb,
  IDB_CHANGE_EVENT,
  saveFavoriteToDb,
} from '../lib/favoritesDb';

const LEGACY_STORAGE_KEY = 'pwa_local_favorites';

/** Migra registros antiguos desde `localStorage` hacia `IndexedDB` una única vez. */
async function migrateLegacyLocalStorageFavorites() {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      await Promise.all(parsed.map((item) => saveFavoriteToDb(item, 'local_only')));
    }
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (err) {
    console.warn('[useLocalFavorites] Aviso al migrar desde localStorage:', err?.message);
  }
}

export function useLocalFavorites() {
  const [favorites, setFavorites] = useState([]);

  const reloadFromIndexedDb = useCallback(async () => {
    try {
      const stored = await getAllFavoritesFromDb();
      setFavorites(stored);
    } catch (err) {
      console.warn('[useLocalFavorites] No se pudo leer IndexedDB:', err?.message);
    }
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      await migrateLegacyLocalStorageFavorites();
      if (active) await reloadFromIndexedDb();
    })();

    const handleIdbChange = () => {
      reloadFromIndexedDb();
    };

    window.addEventListener(IDB_CHANGE_EVENT, handleIdbChange);
    return () => {
      active = false;
      window.removeEventListener(IDB_CHANGE_EVENT, handleIdbChange);
    };
  }, [reloadFromIndexedDb]);

  /** Devuelve `true` si el recurso ya está guardado localmente en IndexedDB. */
  const isLocalFavorite = useCallback(
    (resourceId) => {
      const id = String(resourceId || '');
      return favorites.some((f) => String(f.referencia_id) === id);
    },
    [favorites]
  );

  /** Agrega un recurso a IndexedDB (`TuTurismoDB -> favorites`). Idempotente. */
  const addLocalFavorite = useCallback(async (resource) => {
    const id = resource?.id || resource?._id || resource?.referencia_id;
    if (!id) {
      console.warn('[useLocalFavorites] addLocalFavorite: recurso sin id', resource);
      return;
    }

    const optimisticRecord = buildFavoriteRecord(resource, 'local_only');
    setFavorites((prev) => {
      if (prev.some((f) => String(f.referencia_id) === String(id))) return prev;
      return [optimisticRecord, ...prev];
    });

    await saveFavoriteToDb(resource, 'local_only');
  }, []);

  /** Elimina un recurso de IndexedDB por su `referencia_id`. */
  const removeLocalFavorite = useCallback(async (resourceId) => {
    const id = String(resourceId || '').trim();
    if (!id) return;

    setFavorites((prev) => prev.filter((f) => String(f.referencia_id) !== id));
    await deleteFavoriteFromDb(id);
  }, []);

  /** Alterna el estado de favorito local de un recurso. */
  const toggleLocalFavorite = useCallback(
    (resource) => {
      const id = resource?.id || resource?._id || resource?.referencia_id;
      if (!id) return;
      if (isLocalFavorite(id)) {
        removeLocalFavorite(id);
      } else {
        addLocalFavorite(resource);
      }
    },
    [isLocalFavorite, addLocalFavorite, removeLocalFavorite]
  );

  /** Borra todos los favoritos locales (`local_only`) de IndexedDB. */
  const clearLocalFavorites = useCallback(async () => {
    setFavorites([]);
    await clearLocalOnlyFavoritesFromDb();
  }, []);

  return {
    localFavorites: favorites,
    localFavoritesCount: favorites.length,
    isLocalFavorite,
    addLocalFavorite,
    removeLocalFavorite,
    toggleLocalFavorite,
    clearLocalFavorites,
  };
}
