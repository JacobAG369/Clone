// favoritos con actualizaciones optimistas, persistencia local en IndexedDB y sincronización Background Sync.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { favoritesApi } from '../api/favorites';
import { placesApi } from '../api/places';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import {
  enqueueFavoriteSync,
  getAllFavoritesFromDb,
  getPendingSyncQueue,
  IDB_CHANGE_EVENT,
  mirrorServerFavoritesToDb,
  saveFavoriteToDb,
} from '../lib/favoritesDb';
import {
  flushFavoritesSyncQueueClient,
  registerFavoritesBackgroundSync,
  subscribeToSwSyncMessages,
  syncSwSessionMeta,
} from '../lib/favoritesSync';

const FAVORITES_QUERY_KEY = ['favorites'];
let globalSyncListenersBound = false;

// ---------------------------------------------------------------------------
// Helpers de normalización
// ---------------------------------------------------------------------------

/** Normaliza el tipo de recurso a 'lugar' | 'restaurante' | 'evento'. */
function normalizeTipo(rawTipo = '') {
  const t = String(rawTipo).toLowerCase();
  if (t.includes('restauran') || t.includes('comida') || t.includes('food')) return 'restaurante';
  if (t.includes('event')) return 'evento';
  return 'lugar';
}

/** Extrae los campos de presentación de un documento de recurso (lugar/evento/restaurante). */
function extractRecursoData(doc = {}) {
  return {
    id: doc.id || doc._id || null,
    nombre: doc.nombre || doc.name || doc.title || 'Sin nombre',
    imagen: doc.imagen_url || doc.imagen || doc.imagenes?.[0] || doc.foto || null,
    rating: doc.rating || doc.rating_promedio || doc.calificacion || null,
    municipio: doc.municipio || doc.ciudad || doc.localidad || 'Jalisco',
    categoria: doc.categoria || doc.tipo || 'Atractivo',
    descripcion: doc.descripcion || doc.description || '',
    fecha: doc.fecha_inicio || doc.fecha || null,
    ubicacion: doc.ubicacion || doc.direccion || null,
    location: doc.location || doc.coordenadas || null,
  };
}

/** Normalize favorite resource into standard format (para actualizaciones optimistas). */
function normalizeFavorite(resource) {
  const resourceId = resource.id || resource.referencia_id || resource._id;
  const normTipo = normalizeTipo(
    resource.tipo || resource.tipo_recurso || resource._collectionType || ''
  );

  return {
    id: resourceId,
    referencia_id: resourceId,
    tipo: normTipo,
    recurso: extractRecursoData(resource),
  };
}

/** Detecta si la operación ocurrió sin conectividad de red. */
function isOfflineState(error) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  return error?.code === 'ERR_NETWORK';
}

/** Encola en IndexedDB una alta de favorito realizada sin conexión y registra Background Sync. */
async function queueOfflineAdd(resource) {
  const norm = normalizeFavorite(resource);
  await saveFavoriteToDb({ ...resource, ...norm }, 'pending_add');
  await enqueueFavoriteSync({
    action: 'ADD_FAVORITE',
    referenciaId: norm.referencia_id,
    tipo: norm.tipo,
  });
  await registerFavoritesBackgroundSync();
  toast.info('Guardado localmente (IndexedDB). Se sincronizará al recuperar conexión.');
}

/** Encola en IndexedDB una baja de favorito realizada sin conexión y registra Background Sync. */
async function queueOfflineRemove(resourceId, existingItem) {
  const base = existingItem || { referencia_id: resourceId, tipo: 'lugar' };
  await saveFavoriteToDb(base, 'pending_remove');
  await enqueueFavoriteSync({
    action: 'REMOVE_FAVORITE',
    referenciaId: resourceId,
    tipo: base.tipo || 'lugar',
  });
  await registerFavoritesBackgroundSync();
  toast.info('Eliminado localmente. El cambio se sincronizará al volver la red.');
}

/** Registra una única instancia global de listeners para reconexión y mensajes del Service Worker. */
function ensureGlobalSyncListeners(queryClient) {
  if (globalSyncListenersBound || typeof window === 'undefined') return;
  globalSyncListenersBound = true;

  const notifyAndRefresh = (count) => {
    queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    if (count > 0) {
      toast.success(
        `${count} favorito${count > 1 ? 's' : ''} sincronizado${count > 1 ? 's' : ''} con el servidor.`
      );
    }
  };

  subscribeToSwSyncMessages((payload) => {
    notifyAndRefresh(payload?.syncedCount || 0);
  });

  window.addEventListener('online', async () => {
    const { syncedCount } = await flushFavoritesSyncQueueClient();
    notifyAndRefresh(syncedCount);
  });
}

// ---------------------------------------------------------------------------
// useFavorites Hook — fuente única de verdad con enriquecimiento + IndexedDB Offline
// ---------------------------------------------------------------------------

export function useFavorites() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [idbRecords, setIdbRecords] = useState([]);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const reloadLocalIdbState = useCallback(async () => {
    const [records, queue] = await Promise.all([
      getAllFavoritesFromDb({ includePendingRemove: true }),
      getPendingSyncQueue(),
    ]);
    setIdbRecords(records);
    setPendingSyncCount(queue.length);
  }, []);

  useEffect(() => {
    let active = true;
    ensureGlobalSyncListeners(queryClient);

    Promise.all([
      getAllFavoritesFromDb({ includePendingRemove: true }),
      getPendingSyncQueue(),
    ]).then(([records, queue]) => {
      if (!active) return;
      setIdbRecords(records);
      setPendingSyncCount(queue.length);
    });

    if (isAuthenticated) {
      syncSwSessionMeta().catch(() => {});
    }

    const onIdbUpdate = () => reloadLocalIdbState();
    window.addEventListener(IDB_CHANGE_EVENT, onIdbUpdate);
    return () => {
      active = false;
      window.removeEventListener(IDB_CHANGE_EVENT, onIdbUpdate);
    };
  }, [isAuthenticated, queryClient, reloadLocalIdbState]);

  // 1. Query raw de favoritos (solo {referencia_id, tipo, created_at})
  const favoritesQuery = useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: favoritesApi.getFavorites,
    enabled: isAuthenticated,
    staleTime: 60000,
    placeholderData: [],
  });

  const hasFavoritesToEnrich = (favoritesQuery.data?.length ?? 0) > 0;

  // 2. Queries paralelas de recursos para enriquecer
  const placesQuery = useQuery({
    queryKey: ['all-places-for-fav'],
    queryFn: () => placesApi.getPlaces(),
    enabled: isAuthenticated && hasFavoritesToEnrich,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });

  const restaurantsQuery = useQuery({
    queryKey: ['all-restaurants-for-fav'],
    queryFn: () => placesApi.getRestaurants(),
    enabled: isAuthenticated && hasFavoritesToEnrich,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });

  const eventsQuery = useQuery({
    queryKey: ['all-events-for-fav'],
    queryFn: async () => {
      const res = await api.get('/core/events/');
      return res.data?.data || [];
    },
    enabled: isAuthenticated && hasFavoritesToEnrich,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });

  // 3. Enriquecer favoritos del servidor y combinarlos con el estado offline de IndexedDB
  const serverEnrichedItems = useMemo(() => {
    const lookupMaps = {
      lugar: new Map((placesQuery.data || []).map((r) => [r.id || r._id, r])),
      restaurante: new Map((restaurantsQuery.data || []).map((r) => [r.id || r._id, r])),
      evento: new Map((eventsQuery.data || []).map((r) => [r.id || r._id, r])),
    };

    return (favoritesQuery.data || []).map((fav) => {
      const tipo = normalizeTipo(fav.tipo || '');
      const map = lookupMaps[tipo] || lookupMaps.lugar;
      const docFromApi = map.get(fav.referencia_id);

      return {
        id: fav.referencia_id,
        referencia_id: fav.referencia_id,
        tipo,
        created_at: fav.created_at,
        sync_status: fav.sync_status || 'synced',
        recurso: docFromApi
          ? extractRecursoData(docFromApi)
          : {
              id: fav.referencia_id,
              nombre: fav.nombre || fav.recurso?.nombre || 'Recurso guardado',
              imagen: fav.imagen || fav.recurso?.imagen || null,
              rating: fav.recurso?.rating || null,
              municipio: fav.recurso?.municipio || 'Jalisco',
              categoria: tipo,
              descripcion: fav.recurso?.descripcion || '',
              fecha: null,
              ubicacion: null,
              location: null,
            },
      };
    });
  }, [favoritesQuery.data, placesQuery.data, restaurantsQuery.data, eventsQuery.data]);

  const isEnriching = placesQuery.isLoading || restaurantsQuery.isLoading || eventsQuery.isLoading;

  // Espejar en IndexedDB cuando los datos reales del servidor están listos
  useEffect(() => {
    if (!isAuthenticated || favoritesQuery.isPlaceholderData || isEnriching) return;
    if (Array.isArray(favoritesQuery.data) && navigator.onLine !== false) {
      mirrorServerFavoritesToDb(serverEnrichedItems).then(() => reloadLocalIdbState());
    }
  }, [
    isAuthenticated,
    favoritesQuery.data,
    favoritesQuery.isPlaceholderData,
    isEnriching,
    serverEnrichedItems,
    reloadLocalIdbState,
  ]);

  // Combinación final: respeta bajas pendientes (`pending_remove`) y altas offline (`pending_add`)
  const favoriteItems = useMemo(() => {
    const pendingRemovals = new Set(
      idbRecords.filter((r) => r.sync_status === 'pending_remove').map((r) => r.referencia_id)
    );
    const pendingAdditions = idbRecords.filter((r) => r.sync_status === 'pending_add');

    const baseList =
      serverEnrichedItems.length > 0 || navigator.onLine !== false
        ? serverEnrichedItems
        : idbRecords.filter((r) => r.sync_status !== 'pending_remove');

    const filteredBase = baseList.filter((item) => !pendingRemovals.has(item.referencia_id));
    const existingIds = new Set(filteredBase.map((item) => item.referencia_id));
    const extras = pendingAdditions
      .filter((item) => !existingIds.has(item.referencia_id))
      .map((item) => ({ ...item, id: item.referencia_id }));

    return [...extras, ...filteredBase];
  }, [serverEnrichedItems, idbRecords]);

  // ---------------------------------------------------------------------------
  // isFavorite — derivado del query y cola offline
  // ---------------------------------------------------------------------------
  const isFavorite = (resourceId) => {
    const id = String(resourceId || '');
    if (!id) return false;
    if (idbRecords.some((r) => String(r.referencia_id) === id && r.sync_status === 'pending_remove')) {
      return false;
    }
    if (idbRecords.some((r) => String(r.referencia_id) === id && r.sync_status === 'pending_add')) {
      return true;
    }
    if (!favoritesQuery.data) return false;
    return favoritesQuery.data.some((item) => String(item.referencia_id) === id);
  };

  // ---------------------------------------------------------------------------
  // addFavorite — con optimistic update + fallback offline a IndexedDB/Sync
  // ---------------------------------------------------------------------------
  const addFavoriteMutation = useMutation({
    mutationFn: async (resource) => {
      if (isOfflineState()) {
        await queueOfflineAdd(resource);
        return { offlineQueued: true, referencia_id: resource.id || resource.referencia_id };
      }
      return favoritesApi.addFavorite(resource);
    },
    onMutate: async (resource) => {
      const optimisticFavorite = normalizeFavorite(resource);
      await queryClient.cancelQueries({ queryKey: FAVORITES_QUERY_KEY });
      const previousFavorites = queryClient.getQueryData(FAVORITES_QUERY_KEY) || [];
      queryClient.setQueryData(FAVORITES_QUERY_KEY, (current = []) => [
        {
          referencia_id: optimisticFavorite.id,
          tipo: optimisticFavorite.tipo,
          sync_status: isOfflineState() ? 'pending_add' : 'synced',
          ...resource,
        },
        ...current,
      ]);
      return { previousFavorites, optimisticFavorite };
    },
    onError: async (error, resource, context) => {
      if (isOfflineState(error)) {
        await queueOfflineAdd(resource);
        return;
      }
      if (context?.previousFavorites) {
        queryClient.setQueryData(FAVORITES_QUERY_KEY, context.previousFavorites);
      }
    },
    onSettled: (data) => {
      if (data?.offlineQueued || isOfflineState()) return;
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  // ---------------------------------------------------------------------------
  // removeFavorite — con optimistic update + fallback offline a IndexedDB/Sync
  // ---------------------------------------------------------------------------
  const removeFavoriteMutation = useMutation({
    mutationFn: async (resourceId) => {
      const currentItem = favoriteItems.find((f) => String(f.referencia_id) === String(resourceId));
      if (isOfflineState()) {
        await queueOfflineRemove(resourceId, currentItem);
        return { offlineQueued: true };
      }
      return favoritesApi.removeFavorite(resourceId);
    },
    onMutate: async (resourceId) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_QUERY_KEY });
      const previousFavorites = queryClient.getQueryData(FAVORITES_QUERY_KEY) || [];
      const removedItem = previousFavorites.find(
        (item) => String(item.referencia_id) === String(resourceId)
      );
      queryClient.setQueryData(FAVORITES_QUERY_KEY, (current = []) =>
        current.filter((item) => String(item.referencia_id) !== String(resourceId))
      );
      return { previousFavorites, resourceId, removedItem };
    },
    onError: async (error, resourceId, context) => {
      if (isOfflineState(error)) {
        await queueOfflineRemove(resourceId, context?.removedItem);
        return;
      }
      if (context?.previousFavorites) {
        queryClient.setQueryData(FAVORITES_QUERY_KEY, context.previousFavorites);
      }
    },
    onSettled: (data) => {
      if (data?.offlineQueued || isOfflineState()) return;
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  // ---------------------------------------------------------------------------
  // toggleFavorite / removeFavorite
  // ---------------------------------------------------------------------------
  const removeFavorite = (resourceId) => {
    if (!resourceId) return;
    removeFavoriteMutation.mutate(resourceId);
  };

  const toggleFavorite = (resource) => {
    const id = resource?.id || resource?.referencia_id || resource?._id;
    if (!id) {
      console.warn('[useFavorites] toggleFavorite: recurso sin id', resource);
      return;
    }
    if (isFavorite(id)) {
      removeFavoriteMutation.mutate(id);
    } else {
      addFavoriteMutation.mutate({ ...resource, id });
    }
  };

  return {
    favoritesQuery,
    favoriteItems,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    isUpdatingFavorite: addFavoriteMutation.isPending || removeFavoriteMutation.isPending,
    isLoading: favoritesQuery.isLoading,
    pendingSyncCount,
    addFavoriteMutation,
    removeFavoriteMutation,
    isEnriching,
  };
}
