/**
 * @file src/api/auth.js
 * @description Servicio de autenticación JWT para Tu-Turismo (Fase 3.2).
 *
 * Endpoints del backend (Django REST Framework + PyMongo):
 *   POST /api/v1/core/auth/login/    → Genera access + refresh token.
 *   POST /api/v1/core/auth/refresh/  → Renueva el access token.
 *   GET  /api/v1/core/auth/me/       → Perfil del usuario autenticado.
 *
 * NOTA SOBRE LA RESPUESTA:
 *   A diferencia de /places/ y /restaurants/, los endpoints de auth NO usan
 *   el wrapper { success, data }. Devuelven el payload directamente:
 *     { access_token, refresh_token, token_type, expires_in, user: { id, email, rol, nombre } }
 *   Esto está documentado en core/views/auth.py.
 */

import api from '../lib/axios';

// ---------------------------------------------------------------------------
// login
// ---------------------------------------------------------------------------

/**
 * Autentica a un usuario con email y contraseña.
 *
 * @param {{ email: string, password: string }} credentials
 *   Credenciales del usuario.
 *
 * @returns {Promise<{
 *   access_token:  string,
 *   refresh_token: string,
 *   token_type:    'Bearer',
 *   expires_in:    number,
 *   user: {
 *     id:     string,
 *     email:  string,
 *     rol:    'turista' | 'admin',
 *     nombre: string
 *   }
 * }>}
 *   Objeto con los tokens y el perfil del usuario. Pásalo a
 *   `useAuthStore.getState().setAuthSession(data.user, data.access_token)`.
 *
 * @throws {import('axios').AxiosError} 401 → credenciales incorrectas.
 * @throws {import('axios').AxiosError} 400 → campos faltantes / JSON inválido.
 * @throws {import('axios').AxiosError} 503 → MongoDB no disponible.
 *
 * @example
 * const data = await authApi.login({ email: 'turista@jalisco.mx', password: '...' });
 * useAuthStore.getState().setAuthSession(data.user, data.access_token);
 */
const login = async (credentials) => {
  const response = await api.post('/core/auth/login/', credentials);
  // El backend devuelve el payload directamente (sin wrapper { success, data }).
  return response.data;
};

// ---------------------------------------------------------------------------
// refreshToken
// ---------------------------------------------------------------------------

/**
 * Intercambia un refresh token válido por un nuevo access token.
 *
 * @param {string} refreshToken
 *   El JWT de tipo "refresh" almacenado tras el login.
 *
 * @returns {Promise<{
 *   access_token: string,
 *   token_type:   'Bearer',
 *   expires_in:   number
 * }>}
 *
 * @throws {import('axios').AxiosError} 401 → refresh token inválido o expirado.
 *
 * @example
 * const { access_token } = await authApi.refreshToken(storedRefreshToken);
 */
const refreshToken = async (refreshToken) => {
  const response = await api.post('/core/auth/refresh/', { refresh_token: refreshToken });
  return response.data;
};

// ---------------------------------------------------------------------------
// getMe
// ---------------------------------------------------------------------------

/**
 * Devuelve el perfil del usuario actualmente autenticado.
 * Requiere que el interceptor de Axios haya inyectado el access token.
 *
 * @returns {Promise<{
 *   id:         string,
 *   email:      string,
 *   rol:        'turista' | 'admin',
 *   nombre:     string,
 *   activo:     boolean,
 *   created_at: string
 * }>}
 *   Datos del usuario sin campos sensibles (el backend los omite con to_safe_dict()).
 *
 * @throws {import('axios').AxiosError} 401 → token ausente, inválido o expirado.
 * @throws {import('axios').AxiosError} 404 → usuario ya no existe en MongoDB.
 *
 * @example
 * const user = await authApi.getMe();
 */
const getMe = async () => {
  const response = await api.get('/core/auth/me/');
  return response.data;
};

// ---------------------------------------------------------------------------
// Exportación agrupada
// ---------------------------------------------------------------------------

export const authApi = { login, refreshToken, getMe };
