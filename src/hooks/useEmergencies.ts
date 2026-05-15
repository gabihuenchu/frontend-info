/**
 * useEmergencies.ts
 * Hooks de React Query para emergencias y centros de acopio
 * Requiere: @tanstack/react-query v5
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEmergenciasActivas,
  getEmergenciasGeoJson,
  getAllEmergencias,
  getEmergenciaById,
  createEmergencia,
  updateEstadoEmergencia,
  deleteEmergencia,
  getCentrosAcopio,
  getCentrosCercanos,
  createCentroAcopio,
  updateCentroAcopio,
  deleteCentroAcopio,
  calculateKpis,
  type Emergencia,
  type CrearEmergenciaRequest,
  type ActualizarEstadoRequest,
  type CrearCentroAcopioRequest,
  type KpiData,
} from '../services/emergency.service';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  emergencias: ['emergencias'] as const,
  emergenciasActivas: ['emergencias', 'activas'] as const,
  emergenciasGeoJson: ['emergencias', 'geojson'] as const,
  emergencia: (id: string) => ['emergencias', id] as const,
  centros: ['centros-acopio'] as const,
  centrosCercanos: (lat: number, lng: number) => ['centros-acopio', 'cercanos', lat, lng] as const,
};

/** Opciones de sondeo (false = sin intervalo; útil mientras el usuario dibuja en el mapa). */
export type EmergenciasPollOptions = {
  refetchInterval?: number | false;
};

// ─── Emergencias — Queries ────────────────────────────────────────────────────

/** Lista de emergencias activas — polling por defecto cada 2 min (evita cortar el dibujo en el mapa). */
export const useEmergenciasActivas = (opts?: EmergenciasPollOptions) =>
  useQuery({
    queryKey: QUERY_KEYS.emergenciasActivas,
    queryFn: getEmergenciasActivas,
    refetchInterval: opts?.refetchInterval ?? 120_000,
    staleTime: 60_000,
    placeholderData: (p) => p,
    refetchOnWindowFocus: false,
    retry: 1,
  });

/** Polígonos activos (GeoJSON) para capa en mapa */
export const useEmergenciasGeoJson = (opts?: EmergenciasPollOptions) =>
  useQuery({
    queryKey: QUERY_KEYS.emergenciasGeoJson,
    queryFn: getEmergenciasGeoJson,
    refetchInterval: opts?.refetchInterval ?? 120_000,
    staleTime: 60_000,
    placeholderData: (p) => p,
    refetchOnWindowFocus: false,
    retry: 1,
  });

/** Todas las emergencias (para gestión/admin) */
export const useAllEmergencias = () =>
  useQuery({
    queryKey: QUERY_KEYS.emergencias,
    queryFn: getAllEmergencias,
    staleTime: 15_000,
  });

/** Una emergencia por ID */
export const useEmergencia = (id: string | undefined) =>
  useQuery({
    queryKey: QUERY_KEYS.emergencia(id ?? ''),
    queryFn: () => getEmergenciaById(id!),
    enabled: Boolean(id),
  });

/** KPIs derivados (sin llamada extra al backend) */
export const useEmergenciasKpis = (emergencias: Emergencia[]): KpiData =>
  calculateKpis(emergencias);

// ─── Emergencias — Mutations ──────────────────────────────────────────────────

export const useCreateEmergencia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearEmergenciaRequest) => createEmergencia(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.emergenciasActivas });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.emergenciasGeoJson });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.emergencias });
    },
  });
};

export const useUpdateEstadoEmergencia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ActualizarEstadoRequest }) =>
      updateEstadoEmergencia(id, data),
    onSuccess: (_updated, { id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.emergenciasActivas });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.emergenciasGeoJson });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.emergencia(id) });
    },
  });
};

export const useDeleteEmergencia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmergencia(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.emergenciasActivas });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.emergenciasGeoJson });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.emergencias });
    },
  });
};

// ─── Centros de Acopio — Queries ──────────────────────────────────────────────

export const useCentrosAcopio = () =>
  useQuery({
    queryKey: QUERY_KEYS.centros,
    queryFn: getCentrosAcopio,
    staleTime: 60_000,
  });

export const useCentrosCercanos = (
  lat: number | undefined,
  lng: number | undefined,
  radioKm = 20
) =>
  useQuery({
    queryKey: QUERY_KEYS.centrosCercanos(lat ?? 0, lng ?? 0),
    queryFn: () => getCentrosCercanos(lat!, lng!, radioKm),
    enabled: Boolean(lat && lng),
    staleTime: 30_000,
  });

// ─── Centros de Acopio — Mutations ────────────────────────────────────────────

export const useCreateCentroAcopio = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearCentroAcopioRequest) => createCentroAcopio(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.centros }),
  });
};

export const useUpdateCentroAcopio = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CrearCentroAcopioRequest> }) =>
      updateCentroAcopio(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.centros }),
  });
};

export const useDeleteCentroAcopio = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCentroAcopio(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.centros }),
  });
};