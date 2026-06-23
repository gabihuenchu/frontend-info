import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  actualizarEstadoTransferencia,
  calcularAlertasLogistica,
  calcularKpisLogistica,
  crearMision,
  crearTransferencia,
  listarMisionesVista,
  listarRutasVoluntario,
  listarTransferencias,
  listarTransferenciasVista,
  matchingVoluntarios,
  obtenerMision,
  obtenerMisionDestacada,
  obtenerTransferencia,
  ofrecerRuta,
  toTransferenciaVista,
} from '@/services/logistics.service';
import { listarCentrosLogistica, listarInventarioItems } from '@/services/resources.service';
import type {
  ActualizarEstadoTransferenciaRequest,
  CrearMisionRequest,
  CrearRutaVoluntarioRequest,
  CrearTransferenciaRequest,
} from '@/types/logistics';

export const LOGISTICS_KEYS = {
  transferencias: ['logistica', 'transferencias'] as const,
  centros: ['logistica', 'centros'] as const,
  inventario: (centroId: string) => ['logistica', 'inventario', centroId] as const,
  misiones: ['logistica', 'misiones'] as const,
  rutas: ['logistica', 'rutas'] as const,
  resumen: ['logistica', 'resumen'] as const,
  transferencia: (id: string) => ['logistica', 'transferencia', id] as const,
  mision: (id: string) => ['logistica', 'mision', id] as const,
  matching: (misionId: string) => ['logistica', 'matching', misionId] as const,
};

export const useRutasVoluntario = () =>
  useQuery({
    queryKey: LOGISTICS_KEYS.rutas,
    queryFn: listarRutasVoluntario,
    staleTime: 30_000,
  });

export const useResumenLogistica = () =>
  useQuery({
    queryKey: LOGISTICS_KEYS.resumen,
    queryFn: async () => {
      const [transferencias, misiones, rutas] = await Promise.all([
        listarTransferenciasVista(),
        listarMisionesVista(),
        listarRutasVoluntario(),
      ]);
      return {
        transferencias,
        misiones,
        rutas,
        kpis: calcularKpisLogistica(transferencias, misiones, rutas),
        alertas: calcularAlertasLogistica(transferencias),
        misionDestacada: obtenerMisionDestacada(misiones),
      };
    },
    staleTime: 30_000,
  });

export const useTransferenciasVista = () =>
  useQuery({
    queryKey: LOGISTICS_KEYS.transferencias,
    queryFn: async () => {
      const [items, centros] = await Promise.all([
        listarTransferencias(),
        listarCentrosLogistica().catch(() => []),
      ]);
      const nombres = new Map(centros.map((c) => [c.id, c.nombre]));
      return items.map((t) => toTransferenciaVista(t, nombres));
    },
    staleTime: 30_000,
  });

export const useCentrosLogistica = () =>
  useQuery({
    queryKey: LOGISTICS_KEYS.centros,
    queryFn: listarCentrosLogistica,
    staleTime: 60_000,
  });

export const useInventarioCentro = (centroId: string | null) =>
  useQuery({
    queryKey: LOGISTICS_KEYS.inventario(centroId ?? ''),
    queryFn: () => listarInventarioItems(centroId!),
    enabled: Boolean(centroId),
    staleTime: 15_000,
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

function invalidateLogistica(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: LOGISTICS_KEYS.transferencias });
  qc.invalidateQueries({ queryKey: LOGISTICS_KEYS.misiones });
  qc.invalidateQueries({ queryKey: LOGISTICS_KEYS.rutas });
  qc.invalidateQueries({ queryKey: LOGISTICS_KEYS.resumen });
}

export const useCrearTransferencia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearTransferenciaRequest) => crearTransferencia(data),
    onSuccess: () => invalidateLogistica(qc),
  });
};

export const useActualizarEstadoTransferencia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ActualizarEstadoTransferenciaRequest }) =>
      actualizarEstadoTransferencia(id, data),
    onSuccess: () => {
      invalidateLogistica(qc);
      // Al recibir una transferencia, ms-resources mueve el stock vía evento;
      // invalidamos el inventario y KPIs de recursos para reflejarlo al refrescar.
      qc.invalidateQueries({ queryKey: ['recursos', 'inventario'] });
      qc.invalidateQueries({ queryKey: ['recursos', 'kpis'] });
    },
  });
};

export const useCrearMision = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearMisionRequest) => crearMision(data),
    onSuccess: () => invalidateLogistica(qc),
  });
};

export const useOfrecerRuta = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearRutaVoluntarioRequest) => ofrecerRuta(data),
    onSuccess: () => invalidateLogistica(qc),
  });
};
