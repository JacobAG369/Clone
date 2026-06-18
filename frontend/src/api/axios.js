/**
 * @file src/api/axios.js
 * @description Re-exporta la instancia centralizada de Axios.
 *
 * NOTA: initializeCsrfCookie fue eliminado en Fase 3.1 (migración Laravel → Django JWT).
 * Si encuentras importaciones antiguas de esa función, elimínalas.
 */
export { default } from '../lib/axios';
