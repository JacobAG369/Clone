/**
 * @file src/api/places.js
 * @description Servicio de lugares turísticos y restaurantes para Tu-Turismo (Fase 3.2).
 *
 * Endpoints del backend (Django REST Framework + PyMongo):
 *
 *   LUGARES:
 *     GET /api/v1/core/places/              → Lista general | $near si lat+lng
 *     GET /api/v1/core/places/<id>/         → Detalle por ObjectId
 *     GET /api/v1/core/places/categorias/   → Categorías únicas disponibles
 *     GET /api/v1/core/places/municipios/   → Municipios únicos disponibles
 *
 *   RESTAURANTES:
 *     GET /api/v1/core/restaurants/         → Lista general | $near si lat+lng
 *     GET /api/v1/core/restaurants/<id>/    → Detalle por ObjectId
 *
 * RESPUESTA ESTÁNDAR DEL BACKEND:
 *   { success: true, data: [...], count: N }   → éxito con colección
 *   { success: true, data: {...} }              → éxito con documento único
 *   { success: false, error: "...", detail: "..." } → error
 *
 * Todas las funciones de este servicio desempaquetan `response.data.data`
 * para que TanStack Query reciba los datos ya limpios.
 */

import api from '../lib/axios';

// ---------------------------------------------------------------------------
// Tipos de parámetros (JSDoc)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} GeoParams
 * @property {number}  lat          - Latitud decimal. Rango: -90 a 90.
 * @property {number}  lng          - Longitud decimal. Rango: -180 a 180.
 * @property {number}  [max_distance=10000] - Radio de búsqueda en **metros** (MongoDB $near).
 * @property {number}  [limit=20]   - Máx. resultados (tope del backend: 100).
 */

/**
 * @typedef {Object} ListParams
 * @property {string}  [categoria]  - Filtrar por categoría de lugar (ej. "Balneario").
 * @property {string}  [municipio]  - Filtrar por municipio (ej. "Guadalajara").
 * @property {number}  [limit=20]   - Máx. resultados.
 * @property {number}  [skip=0]     - Offset para paginación.
 */

/**
 * @typedef {Object} PlaceDocument
 * @property {string}   id          - ObjectId como string.
 * @property {string}   nombre      - Nombre del lugar.
 * @property {string}   categoria   - Categoría turística.
 * @property {string}   municipio   - Municipio donde está ubicado.
 * @property {string}   [descripcion]
 * @property {number[]} [location]  - [lng, lat] — formato GeoJSON Point.
 * @property {string}   [imagen_url]
 */

/**
 * @typedef {Object} RestaurantDocument
 * @property {string}   id
 * @property {string}   nombre
 * @property {string}   [categoria]  - Tipo de cocina / categoría.
 * @property {string}   [municipio]
 * @property {number[]} [location]   - [lng, lat] — formato GeoJSON Point.
 * @property {string}   [imagen_url]
 */

// ---------------------------------------------------------------------------
// LUGARES — getPlaces
// ---------------------------------------------------------------------------

/**
 * Obtiene la lista de lugares turísticos.
 *
 * Si se envían `lat` y `lng`, el backend ejecuta una consulta $near de MongoDB
 * y devuelve los resultados ordenados por distancia creciente.
 * Si no, devuelve una lista general paginada con filtros opcionales.
 *
 * @param {(GeoParams & ListParams)} [params={}]
 *   Parámetros de filtrado. Combinar lat+lng activa la búsqueda geoespacial.
 *
 * @returns {Promise<PlaceDocument[]>}
 *   Array de lugares ya desempaquetado de `response.data.data`.
 *
 * @throws {import('axios').AxiosError} 400 → parámetros inválidos (lat sin lng, etc.).
 * @throws {import('axios').AxiosError} 503 → MongoDB no disponible.
 *
 * @example — Lista general
 * const lugares = await placesApi.getPlaces();
 *
 * @example — Filtrado por categoría
 * const balnearios = await placesApi.getPlaces({ categoria: 'Balneario' });
 *
 * @example — Búsqueda por cercanía (requiere lat + lng)
 * const cercanos = await placesApi.getPlaces({ lat: 20.67, lng: -103.34, max_distance: 5000 });
 */
const getPlaces = async (params = {}) => {
  const response = await api.get('/core/places/', { params });
  // Desempaqueta el wrapper estándar: { success: true, data: [...], count: N }
  return response.data.data;
};

// ---------------------------------------------------------------------------
// LUGARES — getPlaceById
// ---------------------------------------------------------------------------

/**
 * Obtiene el detalle de un lugar turístico por su ObjectId de MongoDB.
 *
 * @param {string} placeId
 *   ObjectId del documento como string hexadecimal de 24 caracteres.
 *
 * @returns {Promise<PlaceDocument>}
 *
 * @throws {import('axios').AxiosError} 404 → lugar no encontrado.
 * @throws {import('axios').AxiosError} 503 → MongoDB no disponible.
 *
 * @example
 * const lugar = await placesApi.getPlaceById('64a1f2b3c4d5e6f7a8b9c0d1');
 */
const getPlaceById = async (placeId) => {
  const response = await api.get(`/core/places/${placeId}/`);
  return response.data.data;
};

// ---------------------------------------------------------------------------
// LUGARES — getCategorias / getMunicipios
// ---------------------------------------------------------------------------

/**
 * Devuelve la lista de categorías únicas disponibles en la colección de lugares.
 * Útil para renderizar filtros en la UI (ej. chips, selects).
 *
 * @returns {Promise<string[]>}
 *   Array de strings, ej. ["Balneario", "Zona Arqueológica", "Pueblo Mágico"].
 *
 * @example
 * const categorias = await placesApi.getCategorias();
 */
const getCategorias = async () => {
  const response = await api.get('/core/places/categorias/');
  return response.data.data;
};

/**
 * Devuelve la lista de municipios únicos disponibles en la colección de lugares.
 * Útil para filtros geográficos en la UI.
 *
 * @returns {Promise<string[]>}
 *   Array de strings, ej. ["Guadalajara", "Puerto Vallarta", "Tlaquepaque"].
 *
 * @example
 * const municipios = await placesApi.getMunicipios();
 */
const getMunicipios = async () => {
  const response = await api.get('/core/places/municipios/');
  return response.data.data;
};

// ---------------------------------------------------------------------------
// RESTAURANTES — getRestaurants
// ---------------------------------------------------------------------------

/**
 * Obtiene la lista de restaurantes.
 *
 * Igual que `getPlaces`: si se envían `lat` y `lng`, usa $near de MongoDB.
 * El radio por defecto en el backend es 5 000 metros para restaurantes.
 *
 * @param {(GeoParams & ListParams)} [params={}]
 *
 * @returns {Promise<RestaurantDocument[]>}
 *
 * @throws {import('axios').AxiosError} 400 → parámetros geoespaciales incompletos.
 * @throws {import('axios').AxiosError} 503 → MongoDB no disponible.
 *
 * @example — Restaurantes cercanos en un radio de 2 km
 * const restaurantes = await placesApi.getRestaurants({
 *   lat: 20.67,
 *   lng: -103.34,
 *   max_distance: 2000,
 * });
 */
const getRestaurants = async (params = {}) => {
  const response = await api.get('/core/restaurants/', { params });
  return response.data.data;
};

// ---------------------------------------------------------------------------
// RESTAURANTES — getRestaurantById
// ---------------------------------------------------------------------------

/**
 * Obtiene el detalle de un restaurante por su ObjectId de MongoDB.
 *
 * @param {string} restaurantId
 *   ObjectId como string hexadecimal de 24 caracteres.
 *
 * @returns {Promise<RestaurantDocument>}
 *
 * @throws {import('axios').AxiosError} 404 → restaurante no encontrado.
 *
 * @example
 * const restaurante = await placesApi.getRestaurantById('64a1f2b3c4d5e6f7a8b9c0d2');
 */
const getRestaurantById = async (restaurantId) => {
  const response = await api.get(`/core/restaurants/${restaurantId}/`);
  return response.data.data;
};

// ---------------------------------------------------------------------------
// Exportación agrupada
// ---------------------------------------------------------------------------

export const placesApi = {
  // Lugares turísticos
  getPlaces,
  getPlaceById,
  getCategorias,
  getMunicipios,
  // Restaurantes (misma lógica, colección diferente)
  getRestaurants,
  getRestaurantById,
};
