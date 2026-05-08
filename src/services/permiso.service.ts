import apiClient from './apiClient';

export const PermisoService = {
  // 17. Obtener Todos los Permisos
  getAllPermissions: async (token: string) => {
    const response = await apiClient.get('/permisos', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
