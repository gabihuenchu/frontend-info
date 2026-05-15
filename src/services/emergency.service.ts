/**
 * emergencyService.ts
 * Servicio de emergencias — consume el API Gateway (puerto 8080)
 * MS-2: Coordinación de Emergencias → enrutado a puerto 8082
 */

import apiClient from './apiClient'; // tu axios con interceptor Firebase

// ─── Enums / tipos ────────────────────────────────────────────────────────────

export type TipoEmergencia =
  | 'Incendios Forestales'
  | 'Alerta de Tsunami'
  | 'Inundaciones'
  | 'Terremoto'
  | 'Erupción Volcánica'
  | 'Aluvión'
  | 'INCENDIO'
  | 'SISMO'
  | 'ALUVION'
  | 'INFRAESTRUCTURA'
  | 'MAREJADA';

export type NivelAlerta = 'ALTA' | 'MEDIA' | 'BAJA';
export type NivelSeveridad = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
export type EstadoEmergencia = 'ACTIVA' | 'EN_PROCESO' | 'RESUELTA' | 'CERRADA';

export interface Emergencia {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoEmergencia;
  severidad: NivelSeveridad;
  nivel?: NivelAlerta; // alias usado en la UI legacy
  estado: EstadoEmergencia;
  region: string;
  comunas?: string;
  comuna?: string;
  latitud: number;
  longitud: number;
  afectados?: number;
  personasAfectadas?: number;
  comunasAfectadas?: number;
  hectareasQuemadas?: number;
  iniciada?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CentroAcopio {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  region: string;
  distanciaKm?: number;
  capacidad?: string;
  estado: 'Abierto' | 'En evaluación' | 'Cerrado';
  latitud?: number;
  longitud?: number;
}

// ─── Request / Response shapes ────────────────────────────────────────────────

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

export interface CrearCentroAcopioRequest {
  nombre: string;
  direccion: string;
  ciudad: string;
  region: string;
  latitud?: number;
  longitud?: number;
  capacidad?: string;
  estado?: 'Abierto' | 'En evaluación' | 'Cerrado';
}

export interface KpiData {
  totalActivas: number;
  totalCriticas: number;
  totalAfectados: number;
  regionesMasAfectadas: string[];
}

// ─── Emergencias ─────────────────────────────────────────────────────────────

/** GET /emergencias/activas */
export const getEmergenciasActivas = async (): Promise<Emergencia[]> => {
  const res = await apiClient.get<Emergencia[]>('/emergencias/activas');
  return res.data;
};

/** GET /emergencias */
export const getAllEmergencias = async (): Promise<Emergencia[]> => {
  const res = await apiClient.get<Emergencia[]>('/emergencias');
  return res.data;
};

/** GET /emergencias/:id */
export const getEmergenciaById = async (id: string): Promise<Emergencia> => {
  const res = await apiClient.get<Emergencia>(`/emergencias/${id}`);
  return res.data;
};

/** POST /emergencias */
export const createEmergencia = async (
  data: CrearEmergenciaRequest
): Promise<Emergencia> => {
  const res = await apiClient.post<Emergencia>('/emergencias', data);
  return res.data;
};

/** PATCH /emergencias/:id/estado */
export const updateEstadoEmergencia = async (
  id: string,
  data: ActualizarEstadoRequest
): Promise<Emergencia> => {
  const res = await apiClient.patch<Emergencia>(`/emergencias/${id}/estado`, data);
  return res.data;
};

/** DELETE /emergencias/:id */
export const deleteEmergencia = async (id: string): Promise<void> => {
  await apiClient.delete(`/emergencias/${id}`);
};

// ─── Centros de acopio ────────────────────────────────────────────────────────

/** GET /centros-acopio */
export const getCentrosAcopio = async (): Promise<CentroAcopio[]> => {
  const res = await apiClient.get<CentroAcopio[]>('/centros-acopio');
  return res.data;
};

/** GET /centros-acopio/cercanos?lat=&lng=&radio= */
export const getCentrosCercanos = async (
  lat: number,
  lng: number,
  radioKm = 20
): Promise<CentroAcopio[]> => {
  const res = await apiClient.get<CentroAcopio[]>('/centros-acopio/cercanos', {
    params: { lat, lng, radio: radioKm },
  });
  return res.data;
};

/** POST /centros-acopio */
export const createCentroAcopio = async (
  data: CrearCentroAcopioRequest
): Promise<CentroAcopio> => {
  const res = await apiClient.post<CentroAcopio>('/centros-acopio', data);
  return res.data;
};

/** PATCH /centros-acopio/:id */
export const updateCentroAcopio = async (
  id: string,
  data: Partial<CrearCentroAcopioRequest>
): Promise<CentroAcopio> => {
  const res = await apiClient.patch<CentroAcopio>(`/centros-acopio/${id}`, data);
  return res.data;
};

/** DELETE /centros-acopio/:id */
export const deleteCentroAcopio = async (id: string): Promise<void> => {
  await apiClient.delete(`/centros-acopio/${id}`);
};

// ─── KPIs ─────────────────────────────────────────────────────────────────────

/** Calcula KPIs localmente a partir de una lista de emergencias */
export const calculateKpis = (emergencias: Emergencia[]): KpiData => ({
  totalActivas: emergencias.filter((e) => e.estado === 'ACTIVA').length,
  totalCriticas: emergencias.filter((e) => e.severidad === 'CRITICA').length,
  totalAfectados: emergencias.reduce(
    (sum, e) => sum + (e.afectados ?? e.personasAfectadas ?? 0),
    0
  ),
  regionesMasAfectadas: Array.from(new Set(emergencias.map((e) => e.region))),
});
