'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import {
  getEmergenciasActivas,
  getAllEmergencias,
  getEmergenciaById,
  createEmergencia,
  updateEstadoEmergencia,
  deleteEmergencia,
  CrearEmergenciaRequest,
  ActualizarEstadoRequest,
  calculateKpis,
} from '@/services/emergency.service';
import { Emergencia } from '@/types/emergency';

/**
 * Keys para TanStack Query
 */
export const emergencyKeys = {
  all: ['emergencies'] as const,
  lists: () => [...emergencyKeys.all, 'list'] as const,
  list: (filters: string) => [...emergencyKeys.lists(), { filters }] as const,
  details: () => [...emergencyKeys.all, 'detail'] as const,
  detail: (id: string) => [...emergencyKeys.details(), id] as const,
  kpis: () => [...emergencyKeys.all, 'kpis'] as const,
};

/**
 * Hook para obtener emergencias activas
 * Refetch automático cada 30 segundos como fallback
 */
export const useEmergenciasActivas = (
  options?: UseQueryOptions<Emergencia[], Error>
) => {
  return useQuery({
    queryKey: emergencyKeys.lists(),
    queryFn: getEmergenciasActivas,
    refetchInterval: 30000, // 30 segundos para mantener datos actualizados
    staleTime: 10000, // 10 segundos
    retry: 3,
    ...options,
  });
};

/**
 * Hook para obtener todas las emergencias (gestión)
 */
export const useAllEmergencias = (
  options?: UseQueryOptions<Emergencia[], Error>
) => {
  return useQuery({
    queryKey: emergencyKeys.list('all'),
    queryFn: getAllEmergencias,
    staleTime: 5000,
    retry: 3,
    ...options,
  });
};

/**
 * Hook para obtener una emergencia específica
 */
export const useEmergenciaById = (
  id: string,
  options?: UseQueryOptions<Emergencia, Error>
) => {
  return useQuery({
    queryKey: emergencyKeys.detail(id),
    queryFn: () => getEmergenciaById(id),
    enabled: !!id,
    staleTime: 10000,
    retry: 2,
    ...options,
  });
};

/**
 * Hook para crear una nueva emergencia
 */
export const useCreateEmergencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmergencia,
    onSuccess: () => {
      // Invalidar queries para forzar refetch
      queryClient.invalidateQueries({ queryKey: emergencyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emergencyKeys.list('all') });
    },
  });
};

/**
 * Hook para actualizar el estado de una emergencia
 */
export const useUpdateEstadoEmergencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ActualizarEstadoRequest }) =>
      updateEstadoEmergencia(id, data),
    onSuccess: (_, variables) => {
      // Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: emergencyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emergencyKeys.list('all') });
      queryClient.invalidateQueries({
        queryKey: emergencyKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Hook para calcular KPIs basados en emergencias
 */
export const useEmergenciasKpis = (
  emergencias: Emergencia[] | undefined
) => {
  return {
    data: emergencias ? calculateKpis(emergencias) : null,
    isLoading: !emergencias,
  };
};

/**
 * Hook para eliminar una emergencia
 */
export const useDeleteEmergencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmergencia,
    onSuccess: () => {
      // Invalidar todas las queries de emergencias
      queryClient.invalidateQueries({ queryKey: emergencyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emergencyKeys.list('all') });
      queryClient.invalidateQueries({ queryKey: emergencyKeys.all });
    },
  });
};
