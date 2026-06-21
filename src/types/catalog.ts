/** Catálogo de ítems — ms-resources GET /catalogo/items */

export type CategoriaInventario =
  | 'ALIMENTOS'
  | 'ROPA'
  | 'HERRAMIENTAS'
  | 'ARTICULOS_HIGIENE'
  | 'MATERIALES'
  | 'ARTICULOS_VARIOS'
  | 'MASCOTAS';

export interface ItemCatalogo {
  id: string;
  nombre: string;
  categoria: CategoriaInventario;
  descripcion: string | null;
  unidadMedida: string;
  activo: boolean;
  creadoEn: string;
}
