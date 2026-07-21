// favoritos con actualizaciones optimistas y enriquecimiento de datos desde las APIs de recursos.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '../api/favorites';
import { placesApi } from '../api/places';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';

const FAVORITES_QUERY_KEY = ['favorites'];

// ---------------------------------------------------------------------------
// Helpers de normalización
// ---------------------------------------------------------------------------

/**
 * Normaliza el tipo de recurso a 'lugar' | 'restaurante' | 'evento'
 */
function normalizeTipo(rawTipo = '') {
  const t = String(rawTipo).toLowerCase();
  if (t.includes('restauran') || t.includes('comida') || t.includes('food')) return 'restaurante';
  if (t.includes('event'))                                                      return 'evento';
  return 'lugar';
}

/**
 * Extrae los campos de presentación de un documento de recurso (lugar/evento/restaurante).
 */
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

/**
 * Normalize favorite resource into standard format (para actualizaciones optimistas).
 */
function normalizeFavorite(resource) {
  const resourceId = resource.id || resource.referencia_id || resource._id;
  const normTipo = normalizeTipo(resource.tipo || resource.tipo_recurso || resource._collectionType || '');

  return {
    id: resourceId,
    referencia_id: resourceId,
    tipo: normTipo,
    recurso: extractRecursoData(resource),
  };
}

// ---------------------------------------------------------------------------
// useFavorites Hook — fuente única de verdad con enriquecimiento de recursos
// ---------------------------------------------------------------------------

export function useFavorites() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // 1. Query raw de favoritos (solo {referencia_id, tipo, created_at})
  const favoritesQuery = useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: favoritesApi.getFavorites,
    enabled: isAuthenticated,
    staleTime: 60000,
    placeholderData: [],
  });

  // 2. Queries paralelas de todos los recursos para enriquecer
  const placesQuery = useQuery({
    queryKey: ['all-places-for-fav'],
    queryFn: () => placesApi.getPlaces(),
    enabled: isAuthenticated && (favoritesQuery.data?.length ?? 0) > 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });

  const restaurantsQuery = useQuery({
    queryKey: ['all-restaurants-for-fav'],
    queryFn: () => placesApi.getRestaurants(),
    enabled: isAuthenticated && (favoritesQuery.data?.length ?? 0) > 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });

  const eventsQuery = useQuery({
    queryKey: ['all-events-for-fav'],
    queryFn: async () => {
      const res = await api.get('/core/events/');
      return res.data?.data || [];
    },
    enabled: isAuthenticated && (favoritesQuery.data?.length ?? 0) > 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });

  // 3. Construir lookup maps id → recurso
  const lookupMaps = {
    lugar:       new Map((placesQuery.data     || []).map(r => [r.id || r._id, r])),
    restaurante: new Map((restaurantsQuery.data || []).map(r => [r.id || r._id, r])),
    evento:      new Map((eventsQuery.data      || []).map(r => [r.id || r._id, r])),
  };

  // 4. Enriquecer favoritos con datos reales del recurso
  const favoriteItems = (favoritesQuery.data || []).map((fav) => {
    const tipo = normalizeTipo(fav.tipo || '');
    const map = lookupMaps[tipo] || lookupMaps.lugar;
    const docFromApi = map.get(fav.referencia_id);

    return {
      id: fav.referencia_id,
      referencia_id: fav.referencia_id,
      tipo,
      created_at: fav.created_at,
      recurso: docFromApi ? extractRecursoData(docFromApi) : {
        id: fav.referencia_id,
        nombre: fav.nombre || fav.recurso?.nombre || 'Recurso guardado',
        imagen: fav.imagen || fav.recurso?.imagen || null,
        rating: fav.recurso?.rating || null,
        municipio: 'Jalisco',
        categoria: tipo,
        descripcion: '',
        fecha: null,
        ubicacion: null,
        location: null,
      },
    };
  });

  // ---------------------------------------------------------------------------
  // isFavorite — derivado del query
  // ---------------------------------------------------------------------------
  const isFavorite = (resourceId) => {
    if (!favoritesQuery.data) return false;
    return favoritesQuery.data.some((item) => item.referencia_id === resourceId);
  };

  // ---------------------------------------------------------------------------
  // addFavorite — con optimistic update
  // ---------------------------------------------------------------------------
  const addFavoriteMutation = useMutation({
    mutationFn: favoritesApi.addFavorite,
    onMutate: async (resource) => {
      const optimisticFavorite = normalizeFavorite(resource);
      await queryClient.cancelQueries({ queryKey: FAVORITES_QUERY_KEY });
      const previousFavorites = queryClient.getQueryData(FAVORITES_QUERY_KEY) || [];
      queryClient.setQueryData(FAVORITES_QUERY_KEY, (current = []) => [
        { referencia_id: optimisticFavorite.id, tipo: optimisticFavorite.tipo, ...resource },
        ...current,
      ]);
      return { previousFavorites, optimisticFavorite };
    },
    onError: (_error, _resource, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(FAVORITES_QUERY_KEY, context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  // ---------------------------------------------------------------------------
  // removeFavorite — con optimistic update
  // ---------------------------------------------------------------------------
  const removeFavoriteMutation = useMutation({
    mutationFn: favoritesApi.removeFavorite,
    onMutate: async (resourceId) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_QUERY_KEY });
      const previousFavorites = queryClient.getQueryData(FAVORITES_QUERY_KEY) || [];
      queryClient.setQueryData(FAVORITES_QUERY_KEY, (current = []) =>
        current.filter((item) => item.referencia_id !== resourceId)
      );
      return { previousFavorites, resourceId };
    },
    onError: (_error, _resourceId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(FAVORITES_QUERY_KEY, context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  // ---------------------------------------------------------------------------
  // toggleFavorite
  // ---------------------------------------------------------------------------
  const toggleFavorite = (resource) => {
    if (!resource?.id) {
      console.warn('[useFavorites] toggleFavorite: recurso sin id', resource);
      return;
    }
    if (isFavorite(resource.id)) {
      removeFavoriteMutation.mutate(resource.id);
    } else {
      addFavoriteMutation.mutate(resource);
    }
  };

  const isEnriching = placesQuery.isLoading || restaurantsQuery.isLoading || eventsQuery.isLoading;

  return {
    favoritesQuery,
    favoriteItems,
    isFavorite,
    toggleFavorite,
    addFavoriteMutation,
    removeFavoriteMutation,
    isEnriching,
  };
}
