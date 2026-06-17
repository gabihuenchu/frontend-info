/**
 * useNeeds.ts
 * Hooks para gestión de necesidades (dashboard operador)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearNecesidad } from '@/services/citizen.service';
import type { CrearNecesidadRequest } from '@/types/citizen';
import { CITIZEN_QUERY_KEYS } from './usePublicNeeds';

export const useCreateNeed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearNecesidadRequest) => crearNecesidad(data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['necesidades'] });
      qc.invalidateQueries({
        queryKey: CITIZEN_QUERY_KEYS.centerNeeds(variables.centroId),
      });
      qc.invalidateQueries({
        queryKey: CITIZEN_QUERY_KEYS.donationQuotas(variables.centroId),
      });
    },
  });
};
