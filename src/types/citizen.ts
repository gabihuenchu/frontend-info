/**
 * Tipos para el dominio de Participación Ciudadana
 * MS-4: ms-citizen — necesidades y donaciones
 */

export type PrioridadNecesidad = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export type OrigenNecesidad = 'MANUAL' | 'AUTOMATICO';

export type EstadoNecesidad = 'ACTIVA' | 'PARCIALMENTE_CUBIERTA' | 'RESUELTA';

export type EstadoDonacion = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';

export interface Necesidad {
  id: string;
  centroId: string;
  itemId: string;
  emergenciaId: string | null;
  cantidadNecesaria: number;
  cantidadComprometida: number;
  cantidadRestante: number;
  prioridad: PrioridadNecesidad;
  origen: OrigenNecesidad;
  estado: EstadoNecesidad;
  creadaEn: string;
  resueltaEn: string | null;
}

export interface CupoDonacion {
  itemId: string;
  necesidadId: string;
  cantidadNecesaria: number;
  cantidadComprometida: number;
  cantidadMaximaDonacion: number;
}

export interface DonacionItem {
  id: string;
  itemId: string;
  cantidad: number;
}

export interface Donacion {
  id: string;
  centroId: string;
  usuarioDonanteId: string | null;
  codigoQr: string;
  estado: EstadoDonacion;
  donadoEn: string;
  confirmadoEn: string | null;
  confirmadoPorUsuarioId: string | null;
  cantidadTotal: number;
  items: DonacionItem[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DonacionItemRequest {
  itemId: string;
  cantidad: number;
}

export interface CrearDonacionRequest {
  centroId: string;
  items: DonacionItemRequest[];
}

export interface CrearNecesidadRequest {
  centroId: string;
  itemId: string;
  emergenciaId?: string | null;
  cantidadNecesaria: number;
  prioridad: PrioridadNecesidad;
}
