/**
 * @file src/hooks/useGetLugares.js
 * @description Hook de TanStack Query para obtener los marcadores del mapa con polling.
 *
 * REEMPLAZA: la suscripción a Laravel Echo / Pusher para el canal "mapa-actualizaciones".
 * ESTRATEGIA: Polling cada 30 segundos (refetchInterval).
 *
 * VENTAJAS del polling vs WebSocket en este contexto:
 *  - Sin dependencias de laravel-echo ni pusher-js.
 *  - Funciona con cualquier backend REST (Django, Node, etc.).
 *  - TanStack Query gestiona automáticamente el ciclo de vida:
 *      · Pausa el polling cuando la pestaña pierde el foco (refetchIntervalInBackground: false).
 *      · Reanuda al volver al foco, evitando peticiones innecesarias.
 *  - Comparte caché con otros consumidores del mismo queryKey.
 */

import { useQuery } from '@tanstack/react-query';
import { mapApi } from '../api/map';

// ---------------------------------------------------------------------------
// Constantes de configuración
// ---------------------------------------------------------------------------

/** Tiempo entre re-fetches automáticos mientras la pestaña está activa (ms). */
const POLLING_INTERVAL_MS = 30_000; // 30 segundos

/** Tiempo que los datos se consideran "frescos" antes de ser re-fetched (ms). */
const STALE_TIME_MS = 25_000; // Ligeramente menor al intervalo para evitar doble fetch

// ---------------------------------------------------------------------------
// Query Key Factory — centraliza las claves para facilitar invalidaciones
// ---------------------------------------------------------------------------
export const lugaresKeys = {
  all: ['lugares'],
  byCategory: (categoryId) => ['lugares', 'category', categoryId],
};

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------

/**
 * Obtiene los marcadores del mapa con actualización automática por polling.
 *
 * @param {Object}      options
 * @param {string|null} options.categoryId  - ID de categoría para filtrar (null = todas).
 * @param {boolean}     options.enabled     - Si false, deshabilita el hook (útil en tests).
 *
 * @returns {import('@tanstack/react-query').UseQueryResult}
 *
 * @example
 * const { data: marcadores, isLoading, isError } = useGetLugares({ categoryId: '2' });
 */
export function useGetLugares({ categoryId = null, enabled = true } = {}) {
  return useQuery({
    // La query key incluye categoryId para que cada filtro tenga su propia caché.
    queryKey: lugaresKeys.byCategory(categoryId),

    // Función que hace la petición real. Lanza un error si falla (TanStack lo captura).
    queryFn: () => mapApi.getMarkers(categoryId),

    // ── Estrategia de frescura ──────────────────────────────────────────────
    // Los datos se consideran válidos durante STALE_TIME_MS.
    // Después de ese tiempo, la próxima vez que el componente monte o la ventana
    // recupere el foco, TanStack re-fetcha automáticamente.
    staleTime: STALE_TIME_MS,

    // ── Polling ─────────────────────────────────────────────────────────────
    // Equivalente funcional al listener de WebSocket "mapa-actualizaciones".
    // TanStack Query re-ejecuta queryFn cada POLLING_INTERVAL_MS.
    refetchInterval: POLLING_INTERVAL_MS,

    // Pausa el polling cuando la pestaña está en segundo plano.
    // Ahorra peticiones innecesarias y batería en móviles.
    refetchIntervalInBackground: false,

    // Re-fetch al recuperar el foco de la ventana (ej. el usuario cambia de pestaña).
    refetchOnWindowFocus: true,

    // Control externo: permite deshabilitar el hook desde el componente padre.
    enabled,
  });
}

// ---------------------------------------------------------------------------
// Hook auxiliar — marcadores cercanos (sin polling, se activa por coordenadas)
// ---------------------------------------------------------------------------

/**
 * Obtiene marcadores cercanos a una coordenada geográfica.
 * No usa polling porque solo se ejecuta tras una acción explícita del usuario.
 *
 * @param {Object} options
 * @param {number|null} options.lat    - Latitud.
 * @param {number|null} options.lng    - Longitud.
 * @param {number}      options.radius - Radio en km (default: 5).
 *
 * @example
 * const { data } = useGetNearbyLugares({ lat: -2.1894, lng: -79.8891 });
 */
export function useGetNearbyLugares({ lat = null, lng = null, radius = 5 } = {}) {
  return useQuery({
    queryKey: ['lugares', 'nearby', lat, lng, radius],
    queryFn: () => mapApi.getNearbyMarkers(lat, lng, radius),
    // Solo ejecuta la query si tenemos coordenadas válidas.
    enabled: lat !== null && lng !== null,
    staleTime: STALE_TIME_MS,
  });
}
