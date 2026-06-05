/**
 * usePublicNeeds.ts
 * Hook para listar necesidades públicas (sin autenticación)
 */

import { useQuery } from '@tanstack/react-query';
import { getNecesidadesPublicas } from '@/services/citizen.service';

export const CITIZEN_QUERY_KEYS = {
  publicNeeds: (page: number, size: number) => ['necesidades', 'publicas', page, size] as const,
  centerNeeds: (centroId: string) => ['necesidades', 'centro', centroId] as const,
  myContributions: (page: number, size: number) =>
    ['donaciones', 'mis-contribuciones', page, size] as const,
};

/** Necesidades públicas paginadas — refresco cada 60 s */
export const usePublicNeeds = (page = 0, size = 20) =>
  useQuery({
    queryKey: CITIZEN_QUERY_KEYS.publicNeeds(page, size),
    queryFn: () => getNecesidadesPublicas(page, size),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
