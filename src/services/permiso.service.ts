import apiClient from './apiClient';
import type { PermisoResponse } from '@/types/identity';

export const getAllPermissions = async (): Promise<PermisoResponse[]> => {
  const res = await apiClient.get<PermisoResponse[]>('/permisos');
  return res.data;
};

/** @deprecated Usar getAllPermissions. */
export const PermisoService = {
  getAllPermissions: (_token: string) => getAllPermissions(),
};
