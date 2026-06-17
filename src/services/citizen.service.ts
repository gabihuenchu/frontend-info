/**
 * citizen.service.ts
 * Servicio de participación ciudadana — consume el API Gateway (puerto 8080)
 * MS-4: Participación Ciudadana → enrutado a puerto 8084
 */

import apiClient from './apiClient';
import type {
  Necesidad,
  Donacion,
  PageResponse,
  CrearDonacionRequest,
  CupoDonacion,
  CrearNecesidadRequest,
} from '@/types/citizen';

/** GET /necesidades/publicas */
export const getNecesidadesPublicas = async (
  page = 0,
  size = 20
): Promise<PageResponse<Necesidad>> => {
  const res = await apiClient.get<PageResponse<Necesidad>>('/necesidades/publicas', {
    params: { page, size },
  });
  return res.data;
};

/** GET /necesidades/centro/{centroId}/cupos-donacion */
export const getCuposDonacionPorCentro = async (centroId: string): Promise<CupoDonacion[]> => {
  const res = await apiClient.get<CupoDonacion[]>(
    `/necesidades/centro/${centroId}/cupos-donacion`
  );
  return res.data;
};

/** GET /necesidades/centro/{centroId} */
export const getNecesidadesPorCentro = async (centroId: string): Promise<Necesidad[]> => {
  const res = await apiClient.get<Necesidad[]>(`/necesidades/centro/${centroId}`);
  return res.data;
};

/** POST /donaciones */
export const crearDonacion = async (data: CrearDonacionRequest): Promise<Donacion> => {
  const res = await apiClient.post<Donacion>('/donaciones', data);
  return res.data;
};

/** POST /necesidades — requiere permiso NECESIDAD_GESTIONAR */
export const crearNecesidad = async (data: CrearNecesidadRequest): Promise<Necesidad> => {
  const res = await apiClient.post<Necesidad>('/necesidades', data);
  return res.data;
};

/** GET /donaciones/mis-contribuciones */
export const getMisContribuciones = async (
  page = 0,
  size = 20
): Promise<PageResponse<Donacion>> => {
  const res = await apiClient.get<PageResponse<Donacion>>('/donaciones/mis-contribuciones', {
    params: { page, size },
  });
  return res.data;
};
