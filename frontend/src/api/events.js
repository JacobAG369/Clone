/**
 * @file src/api/events.js
 * @description Servicio de eventos turísticos para Tu-Turismo (Fase 3.2).
 *
 * ESTADO ACTUAL:
 *   El endpoint de eventos está planificado para una fase posterior del backend
 *   (ver tuturismo_backend/urls.py — ruta comentada: /api/v1/destinos/).
 *   Este servicio está preparado con la estructura correcta para cuando el
 *   backend lo implemente, usando el mismo estándar de respuesta:
 *     { success: true, data: [...], count: N }
 *
 * ENDPOINT ESPERADO:
 *   GET /api/v1/core/events/         → Lista de eventos (paginada + filtros)
 *   GET /api/v1/core/events/<id>/    → Detalle de un evento
 *
 * NOTA: Mientras el endpoint no exista en el backend, las queries que usen
 * este servicio recibirán un AxiosError 404. Usa `enabled: false` en el
 * useQuery correspondiente hasta que el endpoint esté disponible.
 */

import api from '../lib/axios';

// ---------------------------------------------------------------------------
// Tipos (JSDoc)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} EventParams
 * @property {string}  [categoria]    - Filtrar por categoría de evento (ej. "Festival").
 * @property {string}  [municipio]    - Filtrar por municipio.
 * @property {string}  [fecha_desde]  - ISO 8601. Eventos a partir de esta fecha.
 * @property {string}  [fecha_hasta]  - ISO 8601. Eventos hasta esta fecha.
 * @property {number}  [limit=20]     - Máx. resultados por página.
 * @property {number}  [skip=0]       - Offset para paginación.
 */

/**
 * @typedef {Object} EventDocument
 * @property {string}   id            - ObjectId como string.
 * @property {string}   nombre        - Nombre del evento.
 * @property {string}   [descripcion]
 * @property {string}   [categoria]   - Tipo de evento (Festival, Expo, Feria, etc.).
 * @property {string}   [municipio]
 * @property {string}   [fecha_inicio] - ISO 8601.
 * @property {string}   [fecha_fin]    - ISO 8601.
 * @property {string}   [imagen_url]
 * @property {number[]} [location]    - [lng, lat] — formato GeoJSON Point.
 */

// ---------------------------------------------------------------------------
// getEvents
// ---------------------------------------------------------------------------

/**
 * Obtiene la lista de eventos turísticos disponibles.
 *
 * Soporta filtros opcionales de categoría, municipio y rango de fechas.
 * La paginación funciona igual que en /places/: parámetros `limit` y `skip`.
 *
 * @param {EventParams} [params={}]
 *   Parámetros opcionales de filtrado y paginación.
 *
 * @returns {Promise<EventDocument[]>}
 *   Array de eventos desempaquetado de `response.data.data`.
 *
 * @throws {import('axios').AxiosError} 404 → endpoint aún no implementado en el backend.
 * @throws {import('axios').AxiosError} 400 → parámetros inválidos.
 * @throws {import('axios').AxiosError} 503 → MongoDB no disponible.
 *
 * @example — Todos los eventos
 * const eventos = await eventsApi.getEvents();
 *
 * @example — Filtrado por categoría y municipio
 * const festivales = await eventsApi.getEvents({
 *   categoria: 'Festival',
 *   municipio: 'Guadalajara',
 * });
 *
 * @example — Con rango de fechas
 * const proximos = await eventsApi.getEvents({
 *   fecha_desde: '2025-07-01',
 *   fecha_hasta: '2025-12-31',
 * });
 */
const getEvents = async (params = {}) => {
  const response = await api.get('/core/events/', { params });
  // Desempaqueta el wrapper estándar: { success: true, data: [...], count: N }
  return response.data.data;
};

// ---------------------------------------------------------------------------
// getEventById
// ---------------------------------------------------------------------------

/**
 * Obtiene el detalle de un evento por su ObjectId de MongoDB.
 *
 * @param {string} eventId
 *   ObjectId del documento como string hexadecimal de 24 caracteres.
 *
 * @returns {Promise<EventDocument>}
 *
 * @throws {import('axios').AxiosError} 404 → evento no encontrado.
 * @throws {import('axios').AxiosError} 503 → MongoDB no disponible.
 *
 * @example
 * const evento = await eventsApi.getEventById('64a1f2b3c4d5e6f7a8b9c0d3');
 */
const getEventById = async (eventId) => {
  const response = await api.get(`/core/events/${eventId}/`);
  return response.data.data;
};

// ---------------------------------------------------------------------------
// getUpcomingEvents (helper de conveniencia)
// ---------------------------------------------------------------------------

/**
 * Atajo para obtener eventos futuros a partir de hoy.
 * Equivalente a llamar `getEvents({ fecha_desde: <hoy ISO> })`.
 *
 * @param {Omit<EventParams, 'fecha_desde'>} [params={}]
 *   Parámetros adicionales (sin `fecha_desde`, que se establece automáticamente).
 *
 * @returns {Promise<EventDocument[]>}
 *
 * @example
 * const { data: proximos } = useQuery({
 *   queryKey: ['events', 'upcoming'],
 *   queryFn: () => eventsApi.getUpcomingEvents({ limit: 10 }),
 * });
 */
const getUpcomingEvents = async (params = {}) => {
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
  return getEvents({ fecha_desde: today, ...params });
};

// ---------------------------------------------------------------------------
// Exportación agrupada
// ---------------------------------------------------------------------------

export const eventsApi = {
  getEvents,
  getEventById,
  getUpcomingEvents,
};
