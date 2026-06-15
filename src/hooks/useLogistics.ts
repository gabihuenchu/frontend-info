import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  actualizarEstadoTransferencia,
  crearMision,
  crearTransferencia,
  getAlertasLogistica,
  getKpisLogistica,
  getMisionDestacada,
  listarMisionesVista,
  listarTransferenciasVista,
  matchingVoluntarios,
  ofrecerRuta,
  obtenerMision,
  obtenerTransferencia,
} from '@/services/logistics.service';
import type {
  ActualizarEstadoTransferenciaRequest,
  CrearMisionRequest,
  CrearRutaVoluntarioRequest,
  CrearTransferenciaRequest,
} from '@/types/logistics';

export const LOGISTICS_KEYS = {
  transferencias: ['logistica', 'transferencias'] as const,
  misiones: ['logistica', 'misiones'] as const,
  kpis: ['logistica', 'kpis'] as const,
  alertas: ['logistica', 'alertas'] as const,
  misionDestacada: ['logistica', 'mision-destacada'] as const,
  transferencia: (id: string) => ['logistica', 'transferencia', id] as const,
  mision: (id: string) => ['logistica', 'mision', id] as const,
  matching: (misionId: string) => ['logistica', 'matching', misionId] as const,
};

export const useKpisLogistica = () =>
  useQuery({ queryKey: LOGISTICS_KEYS.kpis, queryFn: async () => getKpisLogistica(), staleTime: 60_000 });

export const useAlertasLogistica = () =>
  useQuery({ queryKey: LOGISTICS_KEYS.alertas, queryFn: async () => getAlertasLogistica(), staleTime: 60_000 });

export const useMisionDestacada = () =>
  useQuery({ queryKey: LOGISTICS_KEYS.misionDestacada, queryFn: async () => getMisionDestacada(), staleTime: 60_000 });

export const useTransferenciasVista = () =>
  useQuery({
    queryKey: LOGISTICS_KEYS.transferencias,
    queryFn: listarTransferenciasVista,
    staleTime: 30_000,
  });

export const useMisionesVista = () =>
  useQuery({
    queryKey: LOGISTICS_KEYS.misiones,
    queryFn: listarMisionesVista,
    staleTime: 30_000,
  });

export const useTransferencia = (id: string | null) =>
  useQuery({
    queryKey: LOGISTICS_KEYS.transferencia(id ?? ''),
    queryFn: () => obtenerTransferencia(id!),
    enabled: Boolean(id),
  });

export const useMision = (id: string | null) =>
  useQuery({
    queryKey: LOGISTICS_KEYS.mision(id ?? ''),
    queryFn: () => obtenerMision(id!),
    enabled: Boolean(id),
  });

export const useMatchingOsrm = (misionId: string | null) =>
  useQuery({
    queryKey: LOGISTICS_KEYS.matching(misionId ?? ''),
    queryFn: () => matchingVoluntarios(misionId!),
    enabled: Boolean(misionId),
    retry: 1,
  });

export const useCrearTransferencia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearTransferenciaRequest) => crearTransferencia(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: LOGISTICS_KEYS.transferencias }),
  });
};

export const useActualizarEstadoTransferencia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ActualizarEstadoTransferenciaRequest }) =>
      actualizarEstadoTransferencia(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: LOGISTICS_KEYS.transferencias }),
  });
};

export const useCrearMision = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearMisionRequest) => crearMision(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOGISTICS_KEYS.misiones });
      qc.invalidateQueries({ queryKey: LOGISTICS_KEYS.misionDestacada });
    },
  });
};

export const useOfrecerRuta = () =>
  useMutation({
    mutationFn: (data: CrearRutaVoluntarioRequest) => ofrecerRuta(data),
  });
