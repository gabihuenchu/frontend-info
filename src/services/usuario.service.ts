import apiClient from './apiClient';

export interface AssignRoleRequest {
  rolId: string;
}

export interface ChangeStatusRequest {
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
}

export interface RequestRoleRequest {
  rolId: string;
  justificacion: string;
}

export interface ResolveRoleRequest {
  estado: 'APROBADA' | 'RECHAZADA';
}

export const UsuarioService = {
  // 6. Obtener Perfil Usuario (por ID)
  getProfileById: async (id: string, token: string) => {
    const response = await apiClient.get(`/usuarios/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 7. Obtener Mi Perfil
  getMyProfile: async (token: string) => {
    const response = await apiClient.get('/usuarios/yo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 8. Obtener Perfil por Firebase UID
  getProfileByFirebaseUid: async (firebaseUid: string, token: string) => {
    const response = await apiClient.get(`/usuarios/firebase/${firebaseUid}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 9. Obtener Todos los Usuarios
  getAllUsers: async (token: string) => {
    const response = await apiClient.get('/usuarios', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 10. Asignar Rol a Usuario
  assignRole: async (id: string, data: AssignRoleRequest, token: string) => {
    const response = await apiClient.post(`/usuarios/${id}/roles`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 11. Quitar Rol de Usuario
  removeRole: async (id: string, rolId: string, token: string) => {
    const response = await apiClient.delete(`/usuarios/${id}/roles/${rolId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 12. Cambiar Estado de Usuario
  changeStatus: async (id: string, data: ChangeStatusRequest, token: string) => {
    const response = await apiClient.patch(`/usuarios/${id}/estado`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 13. Solicitar Rol
  requestRole: async (data: RequestRoleRequest, token: string) => {
    const response = await apiClient.post('/usuarios/solicitudes-rol', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 14. Resolver Solicitud de Rol
  resolveRoleRequest: async (id: string, data: ResolveRoleRequest, token: string) => {
    const response = await apiClient.patch(`/usuarios/solicitudes-rol/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
