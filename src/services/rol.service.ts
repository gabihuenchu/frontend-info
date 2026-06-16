import apiClient from './apiClient';
import type { RolResponse } from '@/types/identity';

export const getAllRoles = async (): Promise<RolResponse[]> => {
  const res = await apiClient.get<RolResponse[]>('/roles');
  return res.data;
};

export const getRoleById = async (id: string): Promise<RolResponse> => {
  const res = await apiClient.get<RolResponse>(`/roles/${id}`);
  return res.data;
};

export const assignPermissionToRole = async (rolId: string, permisoId: string): Promise<void> => {
  await apiClient.post(`/roles/${rolId}/permisos/${permisoId}`, {});
};

export const removePermissionFromRole = async (rolId: string, permisoId: string): Promise<void> => {
  await apiClient.delete(`/roles/${rolId}/permisos/${permisoId}`);
};

/** @deprecated Usar funciones nombradas. */
export const RolService = {
  assignPermission: (id: string, permisoId: string, _token: string) =>
    assignPermissionToRole(id, permisoId),
  removePermission: (id: string, permisoId: string, _token: string) =>
    removePermissionFromRole(id, permisoId),
};
