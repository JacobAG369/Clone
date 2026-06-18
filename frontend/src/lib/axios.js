/**
 * @file src/lib/axios.js
 * @description Cliente HTTP global para Tu-Turismo (Fase 3.1 — Django REST + JWT).
 *
 * CAMBIOS RESPECTO A LA VERSIÓN LARAVEL:
 *  ✗  Eliminado: withCredentials: true  (ya no hay cookies cross-origin)
 *  ✗  Eliminado: initializeCsrfCookie() / /sanctum/csrf-cookie
 *  ✓  Añadido:   Request interceptor → inyecta "Authorization: Bearer <token>"
 *  ✓  Añadido:   Response interceptor → limpia sesión Zustand en caso de 401
 */

import axios from 'axios';

// Importación LAZY del store para evitar dependencias circulares en el arranque.
// Se resuelve en tiempo de ejecución (dentro del interceptor), no en import-time.
const getAuthStore = () => import('../store/useAuthStore').then((m) => m.useAuthStore);

// ---------------------------------------------------------------------------
// Instancia principal
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  // ❌ withCredentials eliminado: no usamos cookies de sesión, solo cabeceras JWT.
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Interceptor de REQUEST — inyecta el token JWT si existe
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    // Leemos directamente del estado persistido en localStorage.
    // useAuthStore.getState() es la API síncrona de Zustand (no un hook).
    let token = null;

    try {
      // Zustand persist guarda el estado bajo la clave configurada en la store.
      // Si la store no usa persist, el token vive en 'token' directamente.
      token = localStorage.getItem('token');
    } catch {
      // En entornos SSR o con localStorage bloqueado no queremos un crash.
      console.warn('[axios] No se pudo leer localStorage.');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Limpiamos la cabecera si no hay token para evitar enviar "Bearer null".
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Interceptor de RESPONSE — maneja errores globales
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  // Respuestas 2xx pasan sin modificación.
  (response) => response,

  async (error) => {
    const status = error.response?.status;

    // 401 Unauthorized → el token expiró o es inválido.
    // Limpiamos la sesión de Zustand para forzar re-login.
    if (status === 401) {
      try {
        const useAuthStore = await getAuthStore();
        // getState() devuelve el estado actual sin suscribirse (API síncrona).
        useAuthStore.getState().clearSession();
      } catch (storeError) {
        // Si la importación falla, limpiamos localStorage como fallback.
        console.error('[axios] Error al limpiar la sesión de Zustand:', storeError);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      // Redirigimos al login. Usamos window.location para salir del árbol React
      // sin depender de un router específico en esta capa de infraestructura.
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // 403 Forbidden → autenticado pero sin permisos. No hacemos logout.
    if (status === 403) {
      console.warn('[axios] Acceso prohibido (403). El usuario no tiene permisos.');
    }

    // Propagamos el error para que los consumidores (TanStack Query, etc.)
    // puedan manejarlo con su propia lógica de UI (toasts, retry, etc.).
    return Promise.reject(error);
  },
);

export default api;
