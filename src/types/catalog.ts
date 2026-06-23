/** Catálogo de ítems — ms-resources GET /catalogo/items */

export type CategoriaInventario =
  | 'ALIMENTOS'
  | 'ROPA'
  | 'HERRAMIENTAS'
  | 'ARTICULOS_HIGIENE'
  | 'MATERIALES'
  | 'ARTICULOS_VARIOS';

export interface ItemCatalogo {
  id: string;
  nombre: string;
  categoriaId: string;
  /** Codigo enum de la categoria (ALIMENTOS, MATERIALES, ...). */
  codigoCategoria: CategoriaInventario;
  /** Nombre legible de la categoria. */
  nombreCategoria: string;
  descripcion: string | null;
  unidadMedida: string;
  activo: boolean;
  creadoEn: string;
}
