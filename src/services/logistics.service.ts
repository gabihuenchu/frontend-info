import apiClient from './apiClient';
import {
  trackMisionId,
  trackRutaId,
  trackTransferenciaId,
  getMisionIds,
  getRutaIds,
  getTransferenciaIds,
} from '@/lib/logistics-storage';
import {
  MOCK_KPIS,
  MOCK_TRANSFERENCIAS,
  MOCK_MISION_DESTACADA,
  MOCK_ALERTAS,
} from '@/lib/mocks/logistics-mock';
import type {
  ActualizarEstadoTransferenciaRequest,
  CrearMisionRequest,
  CrearRutaVoluntarioRequest,
  CrearTransferenciaRequest,
  KpiLogistica,
  MatchingVoluntarioResponse,
  MisionResponse,
  MisionVista,
  RutaVoluntarioResponse,
  TransferenciaResponse,
  TransferenciaVista,
  AlertaLogistica,
} from '@/types/logistics';

export async function crearTransferencia(
  data: CrearTransferenciaRequest
): Promise<TransferenciaResponse> {
  const res = await apiClient.post<TransferenciaResponse>('/transferencias', data);
  trackTransferenciaId(res.data.id);
  return res.data;
}

export async function obtenerTransferencia(id: string): Promise<TransferenciaResponse> {
  const res = await apiClient.get<TransferenciaResponse>(`/transferencias/${id}`);
  return res.data;
}

export async function actualizarEstadoTransferencia(
  id: string,
  data: ActualizarEstadoTransferenciaRequest
): Promise<TransferenciaResponse> {
  const res = await apiClient.patch<TransferenciaResponse>(`/transferencias/${id}/estado`, data);
  return res.data;
}

export async function crearMision(data: CrearMisionRequest): Promise<MisionResponse> {
  const res = await apiClient.post<MisionResponse>('/misiones', data);
  trackMisionId(res.data.id);
  return res.data;
}

export async function obtenerMision(id: string): Promise<MisionResponse> {
  const res = await apiClient.get<MisionResponse>(`/misiones/${id}`);
  return res.data;
}

export async function ofrecerRuta(
  data: CrearRutaVoluntarioRequest
): Promise<RutaVoluntarioResponse> {
  const res = await apiClient.post<RutaVoluntarioResponse>('/rutas-voluntario', data);
  trackRutaId(res.data.id);
  return res.data;
}

export async function matchingVoluntarios(
  misionId: string
): Promise<MatchingVoluntarioResponse> {
  const res = await apiClient.get<MatchingVoluntarioResponse>(
    `/rutas-voluntario/matching/${misionId}`
  );
  return res.data;
}

function toTransferenciaVista(t: TransferenciaResponse, idx: number): TransferenciaVista {
  const progresoMap: Record<string, number> = {
    SOLICITADA: 10,
    APROBADA: 30,
    EN_TRANSITO: 65,
    RECIBIDA: 100,
    RECHAZADA: 0,
  };
  const prioridadMap: Record<string, 'ALTA' | 'MEDIA' | 'BAJA'> = {
    EN_TRANSITO: 'ALTA',
    APROBADA: 'MEDIA',
    RECIBIDA: 'BAJA',
    SOLICITADA: 'MEDIA',
    RECHAZADA: 'BAJA',
  };
  return {
    ...t,
    codigo: `TRF-${t.id.slice(0, 4).toUpperCase()}`,
    origenNombre: `Centro ${t.centroOrigenId.slice(0, 8)}…`,
    destinoNombre: `Centro ${t.centroDestinoId.slice(0, 8)}…`,
    prioridad: prioridadMap[t.estado] ?? 'MEDIA',
    progreso: progresoMap[t.estado] ?? 20,
    fechaSalida: t.aprobadaEn ?? t.solicitadaEn,
    llegadaEstimada: t.recibidaEn ?? undefined,
  };
}

/** Combina mocks del dashboard con registros reales guardados en localStorage */
export async function listarTransferenciasVista(): Promise<TransferenciaVista[]> {
  const ids = getTransferenciaIds();
  const reales: TransferenciaVista[] = [];
  for (const id of ids) {
    try {
      const t = await obtenerTransferencia(id);
      reales.push(toTransferenciaVista(t, reales.length));
    } catch {
      // ignorar IDs obsoletos
    }
  }
  const mockIds = new Set(MOCK_TRANSFERENCIAS.map((m) => m.id));
  const merged = [...reales, ...MOCK_TRANSFERENCIAS.filter((m) => !mockIds.has(m.id) || reales.length === 0)];
  return reales.length > 0 ? [...reales, ...MOCK_TRANSFERENCIAS.slice(0, 2)] : MOCK_TRANSFERENCIAS;
}

export async function listarMisionesVista(): Promise<MisionVista[]> {
  const ids = getMisionIds();
  const reales: MisionVista[] = [];
  for (const id of ids) {
    try {
      const m = await obtenerMision(id);
      reales.push({
        ...m,
        codigo: `MIS-${m.id.slice(0, 4).toUpperCase()}`,
        destinoNombre: m.emergenciaId ? `Emergencia ${m.emergenciaId.slice(0, 8)}` : 'Sin destino',
        prioridad: 'MEDIA',
        progreso: m.estado === 'COMPLETADA' ? 100 : m.estado === 'EN_CURSO' ? 60 : 20,
      });
    } catch {
      // ignorar
    }
  }
  return reales.length > 0 ? reales : [MOCK_MISION_DESTACADA];
}

export function getKpisLogistica(): KpiLogistica {
  return MOCK_KPIS;
}

export function getAlertasLogistica(): AlertaLogistica[] {
  return MOCK_ALERTAS;
}

export function getMisionDestacada(): MisionVista {
  return MOCK_MISION_DESTACADA;
}

export async function listarRutasIds(): Promise<string[]> {
  return getRutaIds();
}
