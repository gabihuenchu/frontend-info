import apiClient from './apiClient';
import { listarCentrosLogistica } from './resources.service';
import type {
  ActualizarEstadoTransferenciaRequest,
  AlertaLogistica,
  CrearMisionRequest,
  CrearRutaVoluntarioRequest,
  CrearTransferenciaRequest,
  EstadoMision,
  EstadoTransferencia,
  KpiLogistica,
  MatchingVoluntarioResponse,
  MisionResponse,
  MisionVista,
  RutaVoluntarioResponse,
  TransferenciaResponse,
  TransferenciaVista,
} from '@/types/logistics';

export async function listarTransferencias(): Promise<TransferenciaResponse[]> {
  const res = await apiClient.get<TransferenciaResponse[]>('/transferencias');
  return res.data;
}

export async function crearTransferencia(
  data: CrearTransferenciaRequest
): Promise<TransferenciaResponse> {
  const res = await apiClient.post<TransferenciaResponse>('/transferencias', data);
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

export async function listarMisiones(): Promise<MisionResponse[]> {
  const res = await apiClient.get<MisionResponse[]>('/misiones');
  return res.data;
}

export async function crearMision(data: CrearMisionRequest): Promise<MisionResponse> {
  const res = await apiClient.post<MisionResponse>('/misiones', data);
  return res.data;
}

export async function obtenerMision(id: string): Promise<MisionResponse> {
  const res = await apiClient.get<MisionResponse>(`/misiones/${id}`);
  return res.data;
}

export async function listarRutasVoluntario(): Promise<RutaVoluntarioResponse[]> {
  const res = await apiClient.get<RutaVoluntarioResponse[]>('/rutas-voluntario');
  return res.data;
}

export async function ofrecerRuta(
  data: CrearRutaVoluntarioRequest
): Promise<RutaVoluntarioResponse> {
  const res = await apiClient.post<RutaVoluntarioResponse>('/rutas-voluntario', data);
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

const PROGRESO_TRANSFERENCIA: Record<EstadoTransferencia, number> = {
  SOLICITADA: 10,
  APROBADA: 30,
  EN_TRANSITO: 65,
  RECIBIDA: 100,
  RECHAZADA: 0,
};

const PRIORIDAD_TRANSFERENCIA: Record<EstadoTransferencia, TransferenciaVista['prioridad']> = {
  EN_TRANSITO: 'ALTA',
  APROBADA: 'MEDIA',
  RECIBIDA: 'BAJA',
  SOLICITADA: 'MEDIA',
  RECHAZADA: 'BAJA',
};

export function toTransferenciaVista(
  t: TransferenciaResponse,
  nombresCentro?: Map<string, string>
): TransferenciaVista {
  const nombreOrigen =
    nombresCentro?.get(t.centroOrigenId) ?? `Centro ${t.centroOrigenId.slice(0, 8)}…`;
  const nombreDestino = t.centroDestinoId
    ? nombresCentro?.get(t.centroDestinoId) ?? `Centro ${t.centroDestinoId.slice(0, 8)}…`
    : '—';
  return {
    ...t,
    codigo: `TRF-${t.id.slice(0, 8).toUpperCase()}`,
    origenNombre: nombreOrigen,
    destinoNombre: nombreDestino,
    prioridad: PRIORIDAD_TRANSFERENCIA[t.estado],
    progreso: PROGRESO_TRANSFERENCIA[t.estado],
    fechaSalida: t.aprobadaEn ?? t.solicitadaEn,
    llegadaEstimada: t.recibidaEn ?? undefined,
  };
}

function progresoMision(estado: EstadoMision): number {
  if (estado === 'COMPLETADA') return 100;
  if (estado === 'EN_CURSO') return 60;
  if (estado === 'ASIGNADA') return 40;
  if (estado === 'PENDIENTE') return 20;
  return 0;
}

export function toMisionVista(m: MisionResponse): MisionVista {
  return {
    ...m,
    codigo: `MIS-${m.id.slice(0, 8).toUpperCase()}`,
    destinoNombre: m.emergenciaId
      ? `Emergencia ${m.emergenciaId.slice(0, 8)}…`
      : `Centro ${m.centroOrigenId.slice(0, 8)}…`,
    prioridad: m.estado === 'EN_CURSO' ? 'ALTA' : 'MEDIA',
    progreso: progresoMision(m.estado),
  };
}

export async function listarTransferenciasVista(): Promise<TransferenciaVista[]> {
  const [items, centros] = await Promise.all([
    listarTransferencias(),
    listarCentrosLogistica().catch(() => []),
  ]);
  const nombres = new Map(centros.map((c) => [c.id, c.nombre]));
  return items.map((t) => toTransferenciaVista(t, nombres));
}

export async function listarMisionesVista(): Promise<MisionVista[]> {
  const items = await listarMisiones();
  return items.map(toMisionVista);
}

export function calcularKpisLogistica(
  transferencias: TransferenciaVista[],
  misiones: MisionVista[],
  rutas: RutaVoluntarioResponse[]
): KpiLogistica {
  const centros = new Set<string>();
  transferencias.forEach((t) => {
    centros.add(t.centroOrigenId);
    if (t.centroDestinoId) centros.add(t.centroDestinoId);
  });
  misiones.forEach((m) => centros.add(m.centroOrigenId));

  return {
    transferenciasEnCurso: transferencias.filter((t) =>
      ['APROBADA', 'EN_TRANSITO'].includes(t.estado)
    ).length,
    transferenciasDelta: 0,
    misionesActivas: misiones.filter((m) =>
      ['PENDIENTE', 'ASIGNADA', 'EN_CURSO'].includes(m.estado)
    ).length,
    misionesDelta: 0,
    voluntariosDisponibles: rutas.filter((r) => r.disponible).length,
    centrosOperativos: centros.size,
    centrosDelta: 0,
  };
}

function tiempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'Hace un momento';
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  return `Hace ${Math.floor(h / 24)} d`;
}

export function calcularAlertasLogistica(transferencias: TransferenciaVista[]): AlertaLogistica[] {
  const alertas: AlertaLogistica[] = [];

  transferencias
    .filter((t) => t.estado === 'SOLICITADA')
    .slice(0, 3)
    .forEach((t) => {
      alertas.push({
        id: `sol-${t.id}`,
        tipo: 'warning',
        titulo: `Transferencia ${t.codigo} pendiente`,
        descripcion: 'Solicitud esperando aprobación.',
        hace: tiempoRelativo(t.solicitadaEn),
      });
    });

  transferencias
    .filter((t) => t.estado === 'EN_TRANSITO')
    .slice(0, 3)
    .forEach((t) => {
      alertas.push({
        id: `tra-${t.id}`,
        tipo: 'info',
        titulo: `Transferencia ${t.codigo} en tránsito`,
        descripcion: `${t.origenNombre} → ${t.destinoNombre}`,
        hace: tiempoRelativo(t.fechaSalida ?? t.solicitadaEn),
      });
    });

  transferencias
    .filter((t) => t.estado === 'RECIBIDA')
    .slice(0, 2)
    .forEach((t) => {
      alertas.push({
        id: `rec-${t.id}`,
        tipo: 'success',
        titulo: `Transferencia ${t.codigo} recibida`,
        descripcion: `Completada en ${t.destinoNombre}`,
        hace: tiempoRelativo(t.recibidaEn ?? t.solicitadaEn),
      });
    });

  return alertas.slice(0, 6);
}

export function obtenerMisionDestacada(misiones: MisionVista[]): MisionVista | null {
  const activa = misiones.find((m) => m.estado === 'EN_CURSO' || m.estado === 'ASIGNADA');
  return activa ?? misiones[0] ?? null;
}

export interface PuntoMapaLogistica {
  id: string;
  tipo: 'centro' | 'transferencia' | 'mision' | 'voluntario';
  lat: number;
  lng: number;
  label: string;
}

export function puntosMapaDesdeRutas(rutas: RutaVoluntarioResponse[]): PuntoMapaLogistica[] {
  const puntos: PuntoMapaLogistica[] = [];
  rutas.forEach((r) => {
    puntos.push({
      id: `${r.id}-origen`,
      tipo: 'voluntario',
      lat: r.origen.latitud,
      lng: r.origen.longitud,
      label: `${r.etiquetaOrigen} (${r.tipoVehiculo})`,
    });
    puntos.push({
      id: `${r.id}-destino`,
      tipo: 'centro',
      lat: r.destino.latitud,
      lng: r.destino.longitud,
      label: r.etiquetaDestino,
    });
  });
  return puntos;
}
