/**
 * useResources.ts
 * Hooks TanStack Query para ms-resources: centros, inventario por item,
 * operadores, KPIs, sugerencias de redistribución y categorías.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  actualizarCentro,
  eliminarCentro,
  actualizarUmbrales,
  asignarOperador,
  crearCentro,
  listarCategorias,
  listarCentrosDetalle,
  listarInventarioItems,
  listarOperadores,
  listarResumenCategorias,
  obtenerCentro,
  obtenerKpisInventario,
  obtenerSugerencias,
  registrarMovimiento,
} from '@/services/resources.service';
import { isCentrosAcopioApiEnabled } from '@/services/emergency.service';
import type {
  ActualizarCentroPayload,
  AsignarOperadorPayload,
  CategoriaInventario,
  CrearCentroPayload,
  MovimientoInventarioPayload,
  UmbralesPayload,
} from '@/types/resources';

export const RESOURCES_KEYS = {
  centros: (emergenciaId?: string) => ['recursos', 'centros', emergenciaId ?? 'all'] as const,
  centro: (id: string) => ['recursos', 'centro', id] as const,
  inventario: (centroId: string) => ['recursos', 'inventario', centroId] as const,
  resumen: (centroId: string) => ['recursos', 'resumen', centroId] as const,
  operadores: (centroId: string) => ['recursos', 'operadores', centroId] as const,
  kpis: ['recursos', 'kpis'] as const,
  sugerencias: (categoria: CategoriaInventario) => ['recursos', 'sugerencias', categoria] as const,
  categorias: ['recursos', 'categorias'] as const,
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export const useCentrosDetalle = (emergenciaId?: string) =>
  useQuery({
    queryKey: RESOURCES_KEYS.centros(emergenciaId),
    queryFn: () => listarCentrosDetalle(emergenciaId),
    enabled: isCentrosAcopioApiEnabled(),
    staleTime: 30_000,
    placeholderData: [],
  });

export const useCentroDetalle = (centroId: string | null) =>
  useQuery({
    queryKey: RESOURCES_KEYS.centro(centroId ?? ''),
    queryFn: () => obtenerCentro(centroId!),
    enabled: Boolean(centroId),
    staleTime: 30_000,
  });

export const useInventarioItems = (centroId: string | null) =>
  useQuery({
    queryKey: RESOURCES_KEYS.inventario(centroId ?? ''),
    queryFn: () => listarInventarioItems(centroId!),
    enabled: Boolean(centroId),
    staleTime: 15_000,
  });

export const useResumenCategorias = (centroId: string | null) =>
  useQuery({
    queryKey: RESOURCES_KEYS.resumen(centroId ?? ''),
    queryFn: () => listarResumenCategorias(centroId!),
    enabled: Boolean(centroId),
    staleTime: 15_000,
  });

export const useOperadoresCentro = (centroId: string | null, enabled = true) =>
  useQuery({
    queryKey: RESOURCES_KEYS.operadores(centroId ?? ''),
    queryFn: () => listarOperadores(centroId!),
    enabled: Boolean(centroId) && enabled,
    staleTime: 60_000,
    retry: 1,
  });

export const useKpisInventario = () =>
  useQuery({
    queryKey: RESOURCES_KEYS.kpis,
    queryFn: obtenerKpisInventario,
    enabled: isCentrosAcopioApiEnabled(),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });

export const useSugerenciasRedistribucion = (
  categoria: CategoriaInventario | null,
  limite = 10
) =>
  useQuery({
    queryKey: RESOURCES_KEYS.sugerencias(categoria ?? 'ALIMENTOS'),
    queryFn: () => obtenerSugerencias(categoria!, limite),
    enabled: Boolean(categoria),
    staleTime: 30_000,
    retry: 1,
  });

export const useCategorias = () =>
  useQuery({
    queryKey: RESOURCES_KEYS.categorias,
    queryFn: listarCategorias,
    staleTime: 5 * 60_000,
  });

// ─── Mutations ───────────────────────────────────────────────────────────────

function invalidarCentros(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['recursos', 'centros'] });
  qc.invalidateQueries({ queryKey: ['centros-acopio'] });
  qc.invalidateQueries({ queryKey: ['logistica', 'centros'] });
}

export const useCrearCentro = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearCentroPayload) => crearCentro(data),
    onSuccess: () => invalidarCentros(qc),
  });
};

export const useActualizarCentro = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ActualizarCentroPayload }) =>
      actualizarCentro(id, data),
    onSuccess: (_res, { id }) => {
      invalidarCentros(qc);
      qc.invalidateQueries({ queryKey: RESOURCES_KEYS.centro(id) });
    },
  });
};

export const useEliminarCentro = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarCentro(id),
    onSuccess: (_res, id) => {
      invalidarCentros(qc);
      qc.invalidateQueries({ queryKey: RESOURCES_KEYS.centro(id) });
      qc.invalidateQueries({ queryKey: RESOURCES_KEYS.kpis });
    },
  });
};

export const useRegistrarMovimiento = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ centroId, data }: { centroId: string; data: MovimientoInventarioPayload }) =>
      registrarMovimiento(centroId, data),
    onSuccess: (_res, { centroId }) => {
      qc.invalidateQueries({ queryKey: RESOURCES_KEYS.inventario(centroId) });
      qc.invalidateQueries({ queryKey: RESOURCES_KEYS.resumen(centroId) });
      qc.invalidateQueries({ queryKey: RESOURCES_KEYS.kpis });
    },
  });
};

export const useActualizarUmbrales = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ centroId, data }: { centroId: string; data: UmbralesPayload }) =>
      actualizarUmbrales(centroId, data),
    onSuccess: (_res, { centroId }) => {
      qc.invalidateQueries({ queryKey: RESOURCES_KEYS.inventario(centroId) });
      qc.invalidateQueries({ queryKey: RESOURCES_KEYS.resumen(centroId) });
    },
  });
};

export const useAsignarOperador = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ centroId, data }: { centroId: string; data: AsignarOperadorPayload }) =>
      asignarOperador(centroId, data),
    onSuccess: (_res, { centroId }) => {
      qc.invalidateQueries({ queryKey: RESOURCES_KEYS.operadores(centroId) });
    },
  });
};
