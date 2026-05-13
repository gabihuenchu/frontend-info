import apiClient from './apiClient';
import { Emergencia, TipoEmergencia, NivelSeveridad, EstadoEmergencia } from '@/types/emergency';

/**
 * Servicio para gestionar emergencias
 * MS-2: Coordinación de Emergencias (puerto 8082 a través del Gateway 8080)
 */

export interface CrearEmergenciaRequest {
  titulo: string;
  descripcion: string;
  tipo: TipoEmergencia;
  severidad: NivelSeveridad;
  region: string;
  comuna: string;
  latitud: number;
  longitud: number;
  afectados?: number;
}

export interface ActualizarEstadoRequest {
  estado: EstadoEmergencia;
}

export interface EmergenciasResponse {
  emergencias: Emergencia[];
}

export interface KpiData {
  totalActivas: number;
  totalCriticas: number;
  totalAfectados: number;
  regionesMasAfectadas: string[];
}

/**
 * Obtiene todas las emergencias activas
 * GET /emergencias/activas
 */
export const getEmergenciasActivas = async (): Promise<Emergencia[]> => {
  const response = await apiClient.get<Emergencia[]>('/emergencias/activas');
  return response.data;
};

/**
 * Obtiene todas las emergencias (para gestión)
 * GET /emergencias
 */
export const getAllEmergencias = async (): Promise<Emergencia[]> => {
  const response = await apiClient.get<Emergencia[]>('/emergencias');
  return response.data;
};

/**
 * Obtiene una emergencia por ID
 * GET /emergencias/:id
 */
export const getEmergenciaById = async (id: string): Promise<Emergencia> => {
  const response = await apiClient.get<Emergencia>(`/emergencias/${id}`);
  return response.data;
};

/**
 * Crea una nueva emergencia
 * POST /emergencias
 */
export const createEmergencia = async (data: CrearEmergenciaRequest): Promise<Emergencia> => {
  const response = await apiClient.post<Emergencia>('/emergencias', data);
  return response.data;
};

/**
 * Actualiza el estado de una emergencia
 * PATCH /emergencias/:id/estado
 */
export const updateEstadoEmergencia = async (
  id: string,
  data: ActualizarEstadoRequest
): Promise<Emergencia> => {
  const response = await apiClient.patch<Emergencia>(`/emergencias/${id}/estado`, data);
  return response.data;
};

/**
 * Elimina una emergencia
 * DELETE /emergencias/:id
 */
export const deleteEmergencia = async (id: string): Promise<void> => {
  await apiClient.delete(`/emergencias/${id}`);
};

/**
 * Calcula los KPIs a partir de las emergencias
 */
export const calculateKpis = (emergencias: Emergencia[]): KpiData => {
  return {
    totalActivas: emergencias.filter(e => e.estado === 'ACTIVA').length,
    totalCriticas: emergencias.filter(e => e.severidad === 'CRITICA').length,
    totalAfectados: emergencias.reduce((sum, e) => sum + (e.afectados || 0), 0),
    regionesMasAfectadas: Array.from(new Set(emergencias.map(e => e.region)))
  };
};
