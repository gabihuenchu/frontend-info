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
