import api from './axios';

/**
 * Lugares turísticos destacados → GET /api/v1/core/places/
 * Respuesta estándar: { success: true, data: [...], count: N }
 */
export const getLugaresDestacados = async () => {
  const { data } = await api.get('/core/places/');
  return data.data || [];
};

/**
 * Próximos eventos → GET /api/v1/core/events/
 * Respuesta estándar: { success: true, data: [...], count: N }
 */
export const getEventosProximos = async () => {
  const { data } = await api.get('/core/events/');
  return data.data || [];
};

/**
 * Categorías → GET /api/v1/core/categorias/
 * Respuesta estándar: { success: true, data: [...], count: N }
 */
export const getCategorias = async () => {
  const { data } = await api.get('/core/categorias/');
  return data.data || [];
};

/**
 * Restaurantes recomendados → GET /api/v1/core/restaurants/
 * Respuesta estándar: { success: true, data: [...], count: N }
 */
export const getRestaurantesRecomendados = async () => {
  const { data } = await api.get('/core/restaurants/');
  return data.data || [];
};
