/**
 * @file src/api/favorites.js
 * @description Servicio de Favoritos para Tu-Turismo (Django REST Framework).
 *
 * Endpoints del backend:
 *   GET    /api/v1/core/favorites/               → Lista favoritos del usuario autenticado.
 *   GET    /api/v1/core/favorites/?tipo=lugar    → Lista favoritos filtrados por tipo.
 *   POST   /api/v1/core/favorites/               → Agrega un recurso a favoritos.
 *   DELETE /api/v1/core/favorites/<referencia_id>/ → Elimina un favorito.
 *
 * NOTA SOBRE LA RESPUESTA:
 *   Los endpoints de favoritos usan el envoltorio estándar:
 *   { "success": true, "data": [...], "count": N }
 */

import api from './axios';

// ---------------------------------------------------------------------------
// getFavorites  —  GET /core/favorites/
// ---------------------------------------------------------------------------

/**
 * Devuelve todos los favoritos del usuario autenticado.
 *
 * @param {{ tipo?: string }} [options]
 *   Si se pasa `tipo` ("lugar" | "restaurante" | "evento"), filtra en el backend.
 *
 * @returns {Promise<Array<{
 *   id:           string,
 *   user_id:      string,
 *   tipo:         'lugar' | 'restaurante' | 'evento',
 *   referencia_id: string,
 *   created_at:   string
 * }>>}
 */
const getFavorites = async (options = {}) => {
  const params = {};
  if (options.tipo) params.tipo = options.tipo;

  const response = await api.get('/core/favorites/', { params });
  return response.data.data || [];
};

// ---------------------------------------------------------------------------
// addFavorite  —  POST /core/favorites/
// ---------------------------------------------------------------------------

/**
 * Agrega un recurso a la lista de favoritos del usuario.
 *
 * @param {{ tipo: string, id: string } | { tipo_recurso: string, id: string }} resource
 *   Objeto con `tipo` (o `tipo_recurso`) e `id` del recurso a guardar.
 *
 * @returns {Promise<{
 *   id:           string,
 *   user_id:      string,
 *   tipo:         string,
 *   referencia_id: string,
 *   created_at:   string
 * } | null>}
 *
 * @throws {import('axios').AxiosError} 400 → Validación fallida o tipo inválido.
 * @throws {import('axios').AxiosError} 401 → Token ausente o expirado.
 */
const addFavorite = async (resource) => {
  const response = await api.post('/core/favorites/', {
    tipo: resource.tipo || resource.tipo_recurso,
    referencia_id: resource.id || resource.referencia_id,
  });
  // En caso de duplicado el backend devuelve 200 con already_exists: true
  return response.data.data ?? null;
};

// ---------------------------------------------------------------------------
// removeFavorite  —  DELETE /core/favorites/<referencia_id>/
// ---------------------------------------------------------------------------

/**
 * Elimina un favorito de la lista del usuario por ID del recurso.
 *
 * @param {string} resourceId  ObjectId del recurso a eliminar de favoritos.
 *
 * @returns {Promise<{ success: boolean, message: string }>}
 *
 * @throws {import('axios').AxiosError} 404 → El favorito no existe para este usuario.
 * @throws {import('axios').AxiosError} 401 → Token ausente o expirado.
 */
const removeFavorite = async (resourceId) => {
  const response = await api.delete(`/core/favorites/${resourceId}/`);
  return response.data;
};

// ---------------------------------------------------------------------------
// isFavorite  —  Utilidad local (no hace request adicional)
// ---------------------------------------------------------------------------

/**
 * Verifica si un recurso está en una lista de favoritos ya cargada.
 * Esta comprobación es local — no hace ningún request a la API.
 *
 * @param {Array<{ referencia_id: string }>} favorites  Lista de favoritos.
 * @param {string} resourceId                            ID del recurso.
 * @returns {boolean}
 */
const isFavorite = (favorites, resourceId) => {
  return favorites.some((fav) => fav.referencia_id === resourceId);
};

// ---------------------------------------------------------------------------
// Exportación agrupada
// ---------------------------------------------------------------------------

export const favoritesApi = {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
};
