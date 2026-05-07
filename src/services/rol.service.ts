import apiClient from './apiClient';

export const RolService = {
  // 15. Asignar Permiso a Rol
  assignPermission: async (id: string, permisoId: string, token: string) => {
    const response = await apiClient.post(`/roles/${id}/permisos/${permisoId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 16. Quitar Permiso de Rol
  removePermission: async (id: string, permisoId: string, token: string) => {
    const response = await apiClient.delete(`/roles/${id}/permisos/${permisoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
