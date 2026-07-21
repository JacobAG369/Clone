import api from './axios';

// Mapeo: tipo frontend → path de lectura (GET ya existente) y tipo backend admin
const READ_PATHS = {
  lugares:      '/core/places/',
  eventos:      '/core/events/',
  restaurantes: '/core/restaurants/',
};

const ADMIN_RESOURCE = {
  lugares:      'places',
  eventos:      'events',
  restaurantes: 'restaurants',
};

export const adminApi = {
  // ── Usuarios ──────────────────────────────────────────────────────── //
  getUsers: async () => {
    const response = await api.get('/core/admin/users/');
    return response.data.data || [];
  },

  createUser: async (userData) => {
    const response = await api.post('/core/admin/users/', userData);
    return response.data.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/core/admin/users/${id}/`, data);
    return response.data.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/core/admin/users/${id}/`);
    return response.data;
  },

  // ── Recursos (lectura) ────────────────────────────────────────────── //
  getResources: async (resourceType) => {
    const path = READ_PATHS[resourceType];
    if (!path) return [];
    const response = await api.get(path);
    return response.data.data || [];
  },

  getCategories: async () => {
    const response = await api.get('/core/categorias/');
    return response.data.data || [];
  },

  // ── CRUD de escritura (admin) ─────────────────────────────────────── //
  createResource: async ({ resourceType, formData }) => {
    const resource = ADMIN_RESOURCE[resourceType];
    const isMultiPart = formData instanceof FormData;
    const response = await api.post(`/core/admin/${resource}/`, formData, {
      headers: isMultiPart ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data.data;
  },

  updateResource: async ({ resourceType, resourceId, formData }) => {
    const resource = ADMIN_RESOURCE[resourceType];
    const isMultiPart = formData instanceof FormData;
    const response = await api.put(`/core/admin/${resource}/${resourceId}/`, formData, {
      headers: isMultiPart ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data.data;
  },

  deleteResource: async ({ resourceType, resourceId }) => {
    const resource = ADMIN_RESOURCE[resourceType];
    const response = await api.delete(`/core/admin/${resource}/${resourceId}/delete/`);
    return response.data;
  },

  // ── Geo-Analítica Territorial ────────────────────────────────────── //
  getSpatialDensity: async () => {
    const response = await api.get('/core/admin/spatial-density/');
    return response.data.data || [];
  },

  // ── Estadísticas ──────────────────────────────────────────────────── //
  getStats: async () => {
    try {
      const response = await api.get('/core/admin/stats/');
      const data = response.data.data;
      return {
        usersByRole:         data.roles || {},
        resourcesByCategory: {
          lugares:      data.totales?.lugares      || 0,
          eventos:      data.totales?.eventos      || 0,
          restaurantes: data.totales?.restaurantes || 0,
        },
        totalUsers:     data.totales?.usuarios || 0,
        totalResources: (data.totales?.lugares || 0) + (data.totales?.eventos || 0) + (data.totales?.restaurantes || 0),
        growthRate:     data.tasa_crecimiento  || 0,
        pendingAlerts:  data.alertas_pendientes || 0,
      };
    } catch {
      return {
        usersByRole:         { admin: 0, turista: 0 },
        resourcesByCategory: { lugares: 0, eventos: 0, restaurantes: 0 },
        totalUsers:     0,
        totalResources: 0,
        growthRate:     0,
        pendingAlerts:  0,
      };
    }
  },

  // ── Backups ───────────────────────────────────────────────────────── //
  createBackup: async (resource = 'all') => {
    const response = await api.get(`/core/admin/backup/${resource}/`, { responseType: 'blob' });
    return response.data;
  },

  downloadBackup: async (resource = 'all') => {
    const response = await api.get(`/core/admin/backup/${resource}/`, { responseType: 'blob' });
    return response.data;
  },

  listBackups: async () => {
    const now = Date.now();
    return [
      { id: 'full', type: 'full', timestamp: now - 3600000 * 12, size: 4.8, status: 'completado' },
      { id: 'lugares', type: 'lugares', timestamp: now - 3600000 * 36, size: 2.3, status: 'completado' },
      { id: 'usuarios', type: 'usuarios', timestamp: now - 3600000 * 60, size: 0.9, status: 'completado' }
    ];
  },
};
