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

export const mapApi = {
  /**
   * Obtiene los marcadores de lugares para el mapa.
   * Si se pasa categoryId distinto de 'all', filtra por categoría.
   *
   * @param {string|null} categoryId - Categoría a filtrar ('all' = sin filtro).
   * @returns {Promise<Array>} Lista de lugares.
   */
  getMarkers: async (categoryId = 'all') => {
    if (categoryId === 'restaurantes') {
      const response = await api.get('/core/restaurants/');
      return response.data.data ?? [];
    }
    if (categoryId === 'eventos') {
      const response = await api.get('/core/events/');
      return response.data.data ?? [];
    }
    
    const params = {};
    if (categoryId && categoryId !== 'all' && categoryId !== 'lugares') {
      params.categoria = categoryId;
    }
    const response = await api.get('/core/places/', { params });
    return response.data.data ?? [];
  },

  /**
   * Obtiene marcadores de lugares cercanos a una coordenada.
   *
   * @param {number} lat    - Latitud del punto de referencia.
   * @param {number} lng    - Longitud del punto de referencia.
   * @param {number} radius - Radio en kilómetros (se convierte a metros para el backend).
   * @returns {Promise<Array>} Lista de lugares ordenados por distancia.
   */
  getNearbyMarkers: async (lat, lng, radius = 5) => {
    const response = await api.get('/core/places/', {
      params: {
        lat,
        lng,
        // El backend espera max_distance en METROS
        max_distance: radius * 1000,
      },
    });
    return response.data.data ?? [];
  },

  /**
   * Obtiene los marcadores de restaurantes para el mapa.
   *
   * @param {string|null} categoryId - Categoría/tipo de cocina a filtrar.
   * @returns {Promise<Array>} Lista de restaurantes.
   */
  getRestaurantMarkers: async (categoryId = 'all') => {
    const params = {};
    if (categoryId && categoryId !== 'all') {
      params.categoria = categoryId;
    }
    const response = await api.get('/core/restaurants/', { params });
    return response.data.data ?? [];
  },

  /**
   * Obtiene los marcadores de eventos para el mapa.
   *
   * @returns {Promise<Array>} Lista de eventos.
   */
  getEventMarkers: async () => {
    const response = await api.get('/core/events/');
    return response.data.data ?? [];
  },
};
