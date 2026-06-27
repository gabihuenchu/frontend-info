import apiClient from './apiClient';
import type {
  AssignRoleRequest,
  ChangeStatusRequest,
  UsuarioResponse,
} from '@/types/identity';

export type { AssignRoleRequest, ChangeStatusRequest, UsuarioResponse };

export const getUsuarioById = async (id: string): Promise<UsuarioResponse> => {
  const res = await apiClient.get<UsuarioResponse>(`/usuarios/${id}`);
  return res.data;
};

export const getMyProfile = async (): Promise<UsuarioResponse> => {
  const res = await apiClient.get<UsuarioResponse>('/usuarios/yo');
  return res.data;
};

export const getUsuarioByFirebaseUid = async (firebaseUid: string): Promise<UsuarioResponse> => {
  const res = await apiClient.get<UsuarioResponse>(`/usuarios/firebase/${firebaseUid}`);
  return res.data;
};

export const getAllUsers = async (): Promise<UsuarioResponse[]> => {
  const res = await apiClient.get<UsuarioResponse[]>('/usuarios');
  return res.data;
};

export const assignRoleToUser = async (userId: string, data: AssignRoleRequest): Promise<void> => {
  await apiClient.post(`/usuarios/${userId}/roles`, data);
};

export const removeRoleFromUser = async (userId: string, rolId: string): Promise<void> => {
  await apiClient.delete(`/usuarios/${userId}/roles/${rolId}`);
};

export const changeUserStatus = async (userId: string, data: ChangeStatusRequest): Promise<void> => {
  await apiClient.patch(`/usuarios/${userId}/estado`, data);
};

/** @deprecated Usar funciones nombradas; mantiene compatibilidad con sidebar/login. */
export const UsuarioService = {
  getProfileById: (id: string, _token: string) => getUsuarioById(id),
  getMyProfile: (_token: string) => getMyProfile(),
  getProfileByFirebaseUid: (firebaseUid: string, _token: string) => getUsuarioByFirebaseUid(firebaseUid),
  getAllUsers: (_token: string) => getAllUsers(),
  assignRole: (id: string, data: AssignRoleRequest, _token: string) => assignRoleToUser(id, data),
  removeRole: (id: string, rolId: string, _token: string) => removeRoleFromUser(id, rolId),
  changeStatus: (id: string, data: ChangeStatusRequest, _token: string) => changeUserStatus(id, data),
};
