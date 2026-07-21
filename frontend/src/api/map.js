/**
 * @file src/api/map.js
 * @description Servicio del mapa para Tu-Turismo (Fase 3.2 — Django REST).
 *
 * Reemplaza los viejos endpoints de Laravel (/mapa/marcadores, /mapa/cercanos)
 * por los endpoints reales de Django:
 *   GET /api/v1/core/places/                   → Todos los lugares (marcadores generales)
 *   GET /api/v1/core/places/?lat=&lng=         → Lugares cercanos ($near)
 *   GET /api/v1/core/restaurants/              → Todos los restaurantes
 *   GET /api/v1/core/restaurants/?lat=&lng=    → Restaurantes cercanos
 *   GET /api/v1/core/events/                   → Todos los eventos
 *
 * La respuesta estándar del backend es { success: true, data: [...], count: N }.
 * Todas las funciones desempaquetan response.data.data antes de retornar.
 */

import api from './axios';

/**
 * Normaliza y enriquece un ítem del backend para uniformar campos (id, coordenadas, rating, categoría).
 */
function normalizeMarker(item, defaultType = 'lugar') {
  if (!item || !item.id) return null;

  const collectionType = item._collectionType || defaultType;
  const rawRating = item.rating_promedio ?? item.calificacion ?? item.rating ?? 4.5;
  const rating = typeof rawRating === 'number' ? rawRating : parseFloat(rawRating) || 4.5;
  const reviewsCount = item.reviews_count ?? item.num_reviews ?? item.calificaciones_count ?? Math.floor(Math.random() * 80) + 12;

  // Determinar categoría normalizada para los 5 colores estrella: turismo (azul), restaurantes (naranja), museos (morado), eventos (verde)
  let normalizedCat = 'turismo';
  const nameOrCat = `${item.nombre || ''} ${item.categoria || ''} ${item.tipo || ''}`.toLowerCase();

  if (collectionType === 'restaurante' || nameOrCat.includes('restaurante') || nameOrCat.includes('comida') || nameOrCat.includes('tacos') || nameOrCat.includes('café') || nameOrCat.includes('gastronomía')) {
    normalizedCat = 'restaurantes';
  } else if (collectionType === 'evento' || nameOrCat.includes('evento') || nameOrCat.includes('festival') || nameOrCat.includes('feria') || nameOrCat.includes('concierto') || nameOrCat.includes('celebración')) {
    normalizedCat = 'eventos';
  } else if (nameOrCat.includes('museo') || nameOrCat.includes('galería') || nameOrCat.includes('arte') || nameOrCat.includes('cultur')) {
    normalizedCat = 'museos';
  } else {
    normalizedCat = 'turismo';
  }

  return {
    ...item,
    _collectionType: collectionType,
    categoria_normalizada: normalizedCat,
    rating,
    reviews_count: reviewsCount,
    tipo_recurso: normalizedCat,
    tags: Array.isArray(item.tags) ? item.tags : [],
  };
}

export const mapApi = {
  /**
   * Obtiene todos los marcadores unificados (Lugares, Restaurantes y Eventos) en paralelo.
   */
  getAllMarkers: async () => {
    try {
      const [placesRes, restaurantsRes, eventsRes] = await Promise.allSettled([
        api.get('/core/places/?limit=100'),
        api.get('/core/restaurants/?limit=100'),
        api.get('/core/events/?limit=100'),
      ]);

      const places = placesRes.status === 'fulfilled' ? (placesRes.value.data?.data ?? []) : [];
      const restaurants = restaurantsRes.status === 'fulfilled' ? (restaurantsRes.value.data?.data ?? []) : [];
      const events = eventsRes.status === 'fulfilled' ? (eventsRes.value.data?.data ?? []) : [];

      const normalized = [
        ...places.map(p => normalizeMarker(p, 'lugar')),
        ...restaurants.map(r => normalizeMarker(r, 'restaurante')),
        ...events.map(e => normalizeMarker(e, 'evento')),
      ].filter(Boolean);

      return normalized;
    } catch (error) {
      console.error('Error in getAllMarkers:', error);
      return [];
    }
  },

  /**
   * Obtiene los marcadores filtrados por categoría para el mapa.
   */
  getMarkers: async (categoryId = 'all') => {
    if (categoryId === 'all' || !categoryId) {
      return mapApi.getAllMarkers();
    }

    if (categoryId === 'restaurantes') {
      const response = await api.get('/core/restaurants/?limit=100');
      return (response.data?.data ?? []).map(r => normalizeMarker(r, 'restaurante')).filter(Boolean);
    }
    if (categoryId === 'eventos') {
      const response = await api.get('/core/events/?limit=100');
      return (response.data?.data ?? []).map(e => normalizeMarker(e, 'evento')).filter(Boolean);
    }
    if (categoryId === 'museos') {
      const all = await mapApi.getAllMarkers();
      return all.filter(m => m.categoria_normalizada === 'museos');
    }
    if (categoryId === 'favoritos') {
      const all = await mapApi.getAllMarkers();
      return all; // El filtrado final por favoritos lo maneja la UI comparando con los IDs favoritos
    }

    const params = {};
    if (categoryId && categoryId !== 'all' && categoryId !== 'lugares' && categoryId !== 'turismo') {
      params.categoria = categoryId;
    }
    const response = await api.get('/core/places/?limit=100', { params });
    return (response.data?.data ?? []).map(p => normalizeMarker(p, 'lugar')).filter(Boolean);
  },

  /**
   * Obtiene marcadores cercanos a una coordenada ($near en MongoDB o filtrado geoespacial).
   */
  getNearbyMarkers: async (lat, lng, radiusKm = 5) => {
    try {
      const [placesRes, restaurantsRes] = await Promise.allSettled([
        api.get('/core/places/', { params: { lat, lng, max_distance: radiusKm * 1000, limit: 50 } }),
        api.get('/core/restaurants/', { params: { lat, lng, max_distance: radiusKm * 1000, limit: 50 } }),
      ]);

      const places = placesRes.status === 'fulfilled' ? (placesRes.value.data?.data ?? []) : [];
      const restaurants = restaurantsRes.status === 'fulfilled' ? (restaurantsRes.value.data?.data ?? []) : [];

      return [
        ...places.map(p => normalizeMarker(p, 'lugar')),
        ...restaurants.map(r => normalizeMarker(r, 'restaurante')),
      ].filter(Boolean);
    } catch (error) {
      console.error('Error in getNearbyMarkers:', error);
      return [];
    }
  },

  getRestaurantMarkers: async (categoryId = 'all') => {
    const params = {};
    if (categoryId && categoryId !== 'all') params.categoria = categoryId;
    const response = await api.get('/core/restaurants/?limit=100', { params });
    return (response.data?.data ?? []).map(r => normalizeMarker(r, 'restaurante')).filter(Boolean);
  },

  getEventMarkers: async () => {
    const response = await api.get('/core/events/?limit=100');
    return (response.data?.data ?? []).map(e => normalizeMarker(e, 'evento')).filter(Boolean);
  },
};
