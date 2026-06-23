/** Contratos MS Recursos — centros e inventario por categoría */

export type CategoriaInventario =
  | 'ALIMENTOS'
  | 'ARTICULOS_HIGIENE'
  | 'HERRAMIENTAS'
  | 'MATERIALES'
  | 'ROPA'
  | 'ARTICULOS_VARIOS';

export type EstadoCriticidadInventario =
  | 'AGOTADO'
  | 'CRITICO'
  | 'NORMAL'
  | 'ABUNDANTE'
  | 'SOBRESTOCK';

export interface CentroAcopioLogistica {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  region: string;
  estado: string;
  emergenciaId?: string | null;
  latitud?: number;
  longitud?: number;
}

export interface InventarioCategoriaResponse {
  id: string;
  centroId: string;
  categoria: CategoriaInventario;
  stockActual: number;
  umbralMinimo: number;
  umbralOptimo: number;
  umbralMaximo: number;
  estadoCriticidad: EstadoCriticidadInventario;
  actualizadoEn: string;
}

export const ETIQUETA_CATEGORIA: Record<CategoriaInventario, string> = {
  ALIMENTOS: 'Alimentos',
  ARTICULOS_HIGIENE: 'Artículos de higiene',
  HERRAMIENTAS: 'Herramientas',
  MATERIALES: 'Materiales',
  ROPA: 'Ropa',
  ARTICULOS_VARIOS: 'Artículos varios',
};

// ─── Centros e inventario por item (ms-resources, gestión completa) ────────────

export type EstadoCentro = 'ACTIVO' | 'INACTIVO' | 'SATURADO' | 'CERRADO';

export type TipoMovimiento = 'INGRESO' | 'EGRESO';

export interface GeoJsonPunto {
  type?: string;
  coordinates?: [number, number];
}

/** Detalle de centro mapeado de ms-resources CentroResponse (lat/lng extraídos). */
export interface CentroDetalle {
  id: string;
  nombre: string;
  direccion: string | null;
  region: string | null;
  comuna: string | null;
  capacidad: number | null;
  horario: string | null;
  estado: EstadoCentro;
  emergenciaId: string | null;
  creadoPorUsuarioId: string | null;
  latitud?: number;
  longitud?: number;
  creadoEn: string;
  actualizadoEn: string;
}

/** Inventario a nivel de ítem (ms-resources InventarioItemResponse). */
export interface InventarioItem {
  id: string;
  centroId: string;
  itemCatalogoId: string;
  itemNombre: string;
  codigoCategoria: string;
  nombreCategoria: string;
  unidadMedida: string;
  stockActual: number;
  umbralMinimo: number;
  umbralOptimo: number;
  umbralMaximo: number;
  estadoCriticidad: EstadoCriticidadInventario;
  actualizadoEn: string;
}

export interface ResumenCategoria {
  codigoCategoria: string;
  nombreCategoria: string;
  stockTotal: number;
  estadoCriticidadAgregado: EstadoCriticidadInventario;
}

export interface OperadorCentro {
  id: string;
  centroId: string;
  usuarioId: string;
  asignadoPorUsuarioId: string | null;
  asignadoEn: string;
}

export interface MovimientoInventarioResultado {
  itemCatalogoId: string;
  itemNombre: string;
  codigoCategoria: string;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  stockAnterior: number;
  stockActual: number;
  estadoCriticidad: EstadoCriticidadInventario;
  actualizadoEn: string;
}

export interface KpisInventario {
  centrosActivos: number;
  itemsCriticosOAgotados: number;
  itemsSobrestock: number;
  movimientosUltimas24h: number;
}

export interface SugerenciaRedistribucion {
  categoria: CategoriaInventario;
  itemCatalogoId: string;
  itemNombre: string;
  centroOrigenId: string;
  centroOrigenNombre: string;
  stockOrigen: number;
  criticidadOrigen: EstadoCriticidadInventario;
  centroDestinoId: string;
  centroDestinoNombre: string;
  stockDestino: number;
  criticidadDestino: EstadoCriticidadInventario;
  distanciaMetros: number;
  cantidadSugerida: number;
}

export interface Categoria {
  id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
  orden: number;
  creadoEn: string;
}

// ─── Requests ──────────────────────────────────────────────────────────────────

export interface CrearCentroPayload {
  nombre: string;
  direccion?: string;
  coordenadas: { longitud: number; latitud: number };
  region?: string;
  comuna?: string;
  capacidad?: number;
  horario?: string;
  estado?: EstadoCentro;
}

export interface ActualizarCentroPayload {
  nombre?: string;
  direccion?: string;
  region?: string;
  comuna?: string;
  capacidad?: number;
  horario?: string;
  estado?: EstadoCentro;
  /** Emergencia activa a asociar al centro (validada en ms-resources). */
  emergenciaId?: string;
}

export interface MovimientoInventarioPayload {
  itemCatalogoId: string;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
}

export interface UmbralesPayload {
  itemCatalogoId: string;
  umbralMinimo: number;
  umbralOptimo: number;
  umbralMaximo: number;
}

export interface AsignarOperadorPayload {
  usuarioId: string;
}

// ─── Etiquetas UI ────────────────────────────────────────────────────────────

export const ETIQUETA_ESTADO_CENTRO: Record<EstadoCentro, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  SATURADO: 'Saturado',
  CERRADO: 'Cerrado',
};

export const ETIQUETA_CRITICIDAD: Record<EstadoCriticidadInventario, string> = {
  AGOTADO: 'Agotado',
  CRITICO: 'Crítico',
  NORMAL: 'Normal',
  ABUNDANTE: 'Abundante',
  SOBRESTOCK: 'Sobrestock',
};
