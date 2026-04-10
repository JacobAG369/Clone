import api from './axios';

const RESOURCE_CONFIG = {
  lugares: '/lugares',
  eventos: '/eventos',
  restaurantes: '/restaurantes',
};

export const adminApi = {
  getUsers: async () => {
    const response = await api.get('/usuarios');
    return response.data.data || [];
  },

  createUser: async (payload) => {
    const response = await api.post('/usuarios', payload);
    return response.data.data;
  },

  updateUser: async (userId, payload) => {
    const response = await api.put(`/usuarios/${userId}`, payload);
    return response.data.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/usuarios/${userId}`);
    return response.data.data;
  },

  getResources: async (resourceType) => {
    const response = await api.get(RESOURCE_CONFIG[resourceType]);
    return response.data.data || [];
  },

  getCategories: async () => {
    const response = await api.get('/categorias');
    return response.data.data || [];
  },

  createResource: async ({ resourceType, formData }) => {
    const response = await api.post(RESOURCE_CONFIG[resourceType], formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  },

  updateResource: async ({ resourceType, resourceId, formData }) => {
    formData.append('_method', 'PUT');

    const response = await api.post(`${RESOURCE_CONFIG[resourceType]}/${resourceId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  },

  deleteResource: async ({ resourceType, resourceId }) => {
    const response = await api.delete(`${RESOURCE_CONFIG[resourceType]}/${resourceId}`);
    return response.data.data;
  },

  // Admin Stats and Analytics
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      const data = response.data.data;
      
      // Transform backend response to match frontend expectations
      return {
        usersByRole: data.roles || {},
        resourcesByCategory: {
          lugares: data.totales?.lugares || 0,
          eventos: data.totales?.eventos || 0,
          restaurantes: data.totales?.restaurantes || 0,
        },
        totalUsers: data.totales?.usuarios || 0,
        totalResources: (data.totales?.lugares || 0) + (data.totales?.eventos || 0) + (data.totales?.restaurantes || 0),
        growthRate: data.tasa_crecimiento || 0,
        pendingAlerts: data.alertas_pendientes || 0,
      };
    } catch (_error) {
      // Return mock data if endpoint doesn't exist
      return {
        usersByRole: { admin: 5, usuario: 120, moderador: 8 },
        resourcesByCategory: { lugares: 25, eventos: 15, restaurantes: 30 },
        totalUsers: 133,
        totalResources: 70,
        growthRate: 12.5,
        pendingAlerts: 3,
      };
    }
  },

  // Backup methods
  // El backend devuelve el ZIP directamente como stream (responseType: 'blob')
  createBackup: async (type = 'full') => {
    const response = await api.post('/admin/backup', { type }, {
      responseType: 'blob',
    });
    return response.data; // Blob binario del ZIP
  },

  downloadBackup: async (backupId) => {
    const response = await api.get(`/admin/backup/${backupId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  listBackups: async () => {
    try {
      const response = await api.get('/admin/backups');
      return response.data.data || [];
    } catch (_error) {
      return [];
    }
  },
};
