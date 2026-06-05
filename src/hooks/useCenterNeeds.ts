/**
 * useCenterNeeds.ts
 * Hook para necesidades de un centro de acopio (wizard paso 2)
 */

import { useQuery } from '@tanstack/react-query';
import { getNecesidadesPorCentro } from '@/services/citizen.service';
import { CITIZEN_QUERY_KEYS } from './usePublicNeeds';

/** Necesidades activas de un centro específico */
export const useCenterNeeds = (centroId: string | undefined) =>
  useQuery({
    queryKey: CITIZEN_QUERY_KEYS.centerNeeds(centroId ?? ''),
    queryFn: () => getNecesidadesPorCentro(centroId!),
    enabled: Boolean(centroId),
    staleTime: 30_000,
  });
