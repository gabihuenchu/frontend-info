/** Contratos MS Logística — gateway :8080 */

export type EstadoTransferencia =
  | 'SOLICITADA'
  | 'APROBADA'
  | 'EN_TRANSITO'
  | 'RECIBIDA'
  | 'RECHAZADA';

export type EstadoMision =
  | 'PENDIENTE'
  | 'ASIGNADA'
  | 'EN_CURSO'
  | 'COMPLETADA'
  | 'CANCELADA';

export type TipoVehiculo = 'AUTO' | 'CAMIONETA' | 'CAMION' | 'FURGON';

export type PrioridadLogistica = 'ALTA' | 'MEDIA' | 'BAJA';

/** Destino de una transferencia: entre centros, a un punto de distribución o entrega a la comunidad. */
export type TipoDestinoTransferencia = 'CENTRO' | 'PUNTO_DISTRIBUCION' | 'COMUNIDAD';

export interface CoordenadaDto {
  longitud: number;
  latitud: number;
}

export interface ItemTransferenciaRequest {
  itemId: string;
  cantidad: number;
}

export interface CrearTransferenciaRequest {
  centroOrigenId: string;
  /** Obligatorio solo cuando tipoDestino === 'CENTRO'. */
  centroDestinoId?: string | null;
  tipoDestino: TipoDestinoTransferencia;
  notas?: string;
  items: ItemTransferenciaRequest[];
}

export interface ActualizarEstadoTransferenciaRequest {
  nuevoEstado: EstadoTransferencia;
}

export interface CrearMisionRequest {
  centroOrigenId: string;
  emergenciaId?: string | null;
  descripcionCarga?: Record<string, unknown> | null;
  programadaEn?: string | null;
}

export interface CrearRutaVoluntarioRequest {
  origen: CoordenadaDto;
  etiquetaOrigen: string;
  destino: CoordenadaDto;
  etiquetaDestino: string;
  tipoVehiculo: TipoVehiculo;
  capacidadKg: number;
}

export interface ItemTransferenciaResponse {
  id: string;
  itemId: string;
  cantidad: number;
}

export interface TransferenciaResponse {
  id: string;
  centroOrigenId: string;
  centroDestinoId: string | null;
  tipoDestino: TipoDestinoTransferencia;
  solicitadoPorUsuarioId: string;
  aprobadoPorUsuarioId: string | null;
  estado: EstadoTransferencia;
  notas: string | null;
  solicitadaEn: string;
  aprobadaEn: string | null;
  recibidaEn: string | null;
  items: ItemTransferenciaResponse[];
}

export interface MisionResponse {
  id: string;
  centroOrigenId: string;
  emergenciaId: string | null;
  creadaPorUsuarioId: string;
  estado: EstadoMision;
  descripcionCarga: Record<string, unknown> | null;
  programadaEn: string | null;
  completadaEn: string | null;
  creadaEn: string;
}

export interface RutaVoluntarioResponse {
  id: string;
  usuarioId: string;
  origen: CoordenadaDto;
  etiquetaOrigen: string;
  destino: CoordenadaDto;
  etiquetaDestino: string;
  tipoVehiculo: TipoVehiculo;
  capacidadKg: number;
  disponible: boolean;
  creadaEn: string;
}

export interface CandidatoMatchingResponse {
  rutaVoluntarioId: string;
  usuarioId: string;
  distanciaMetrosOsrm: number;
  capacidadKg: number;
  etiquetaOrigen: string;
  etiquetaDestino: string;
}

export interface MatchingVoluntarioResponse {
  misionId: string;
  candidatos: CandidatoMatchingResponse[];
}

/** Vista enriquecida para tablas del dashboard (datos API) */
export interface TransferenciaVista extends TransferenciaResponse {
  codigo: string;
  origenNombre: string;
  destinoNombre: string;
  prioridad: PrioridadLogistica;
  progreso: number;
  fechaSalida?: string;
  llegadaEstimada?: string;
}

export interface MisionVista extends MisionResponse {
  codigo: string;
  destinoNombre: string;
  prioridad: PrioridadLogistica;
  progreso: number;
  voluntarioNombre?: string;
}

export interface AlertaLogistica {
  id: string;
  tipo: 'warning' | 'info' | 'success' | 'danger';
  titulo: string;
  descripcion: string;
  hace: string;
}

export interface KpiLogistica {
  transferenciasEnCurso: number;
  transferenciasDelta: number;
  misionesActivas: number;
  misionesDelta: number;
  voluntariosDisponibles: number;
  centrosOperativos: number;
  centrosDelta: number;
}

export const PERMISOS_LOGISTICA = {
  SOLICITAR: 'TRANSFERENCIA_SOLICITAR',
  APROBAR: 'TRANSFERENCIA_APROBAR',
  MISION: 'MISION_CREAR',
  RUTA: 'RUTA_OFRECER',
} as const;
