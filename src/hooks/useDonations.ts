/**
 * useDonations.ts
 * Hooks para crear donaciones y consultar el historial del usuario
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  confirmarDonacion,
  crearDonacion,
  getCuposDonacionPorCentro,
  getMisContribuciones,
} from '@/services/citizen.service';
import type { CrearDonacionRequest } from '@/types/citizen';
import { CITIZEN_QUERY_KEYS } from './usePublicNeeds';

/** Historial de contribuciones del usuario autenticado */
export const useMyContributions = (page = 0, size = 20) =>
  useQuery({
    queryKey: CITIZEN_QUERY_KEYS.myContributions(page, size),
    queryFn: () => getMisContribuciones(page, size),
    staleTime: 30_000,
  });

/** Cupos de donación por ítem en un centro (cantidad máxima permitida) */
export const useDonationQuotas = (centroId: string | undefined) =>
  useQuery({
    queryKey: CITIZEN_QUERY_KEYS.donationQuotas(centroId ?? ''),
    queryFn: () => getCuposDonacionPorCentro(centroId!),
    enabled: Boolean(centroId),
    staleTime: 30_000,
  });

/** Crear una nueva donación (DonationForm) */
export const useCreateDonation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearDonacionRequest) => crearDonacion(data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['donaciones', 'mis-contribuciones'] });
      qc.invalidateQueries({ queryKey: ['necesidades'] });
      qc.invalidateQueries({
        queryKey: CITIZEN_QUERY_KEYS.donationQuotas(variables.centroId),
      });
    },
  });
};

/**
 * Confirmar una donación por código QR (panel operador).
 * Al confirmar, ms-resources suma el stock vía el evento donation.confirmed,
 * por lo que invalidamos necesidades, cupos e inventario.
 */
export const useConfirmDonation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (codigoQr: string) => confirmarDonacion(codigoQr),
    onSuccess: (donacion) => {
      qc.invalidateQueries({ queryKey: ['necesidades'] });
      qc.invalidateQueries({ queryKey: ['donaciones'] });
      if (donacion?.centroId) {
        qc.invalidateQueries({ queryKey: CITIZEN_QUERY_KEYS.centerNeeds(donacion.centroId) });
        qc.invalidateQueries({ queryKey: CITIZEN_QUERY_KEYS.donationQuotas(donacion.centroId) });
        qc.invalidateQueries({ queryKey: ['recursos', 'inventario', donacion.centroId] });
      }
    },
  });
};
