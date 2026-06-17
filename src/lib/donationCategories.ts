import type { CategoriaInventario } from '@/types/catalog';

export type DonationCategoryId =
  | 'alimentos'
  | 'vestuario'
  | 'herramientas'
  | 'utiles-aseo'
  | 'alojamiento-enseres';

export interface DonationCategoryConfig {
  id: DonationCategoryId;
  label: string;
  description: string;
  apiCategoria: CategoriaInventario;
}

/** Las 5 categorías acordadas con el equipo → enum del catálogo ms-resources */
export const DONATION_CATEGORIES: DonationCategoryConfig[] = [
  {
    id: 'alimentos',
    label: 'Alimentos',
    description: 'Arroz, agua, conservas y alimentos no perecederos.',
    apiCategoria: 'ALIMENTOS',
  },
  {
    id: 'vestuario',
    label: 'Vestuario',
    description: 'Ropa, calzado y abrigo para familias afectadas.',
    apiCategoria: 'ROPA',
  },
  {
    id: 'herramientas',
    label: 'Herramientas',
    description: 'Palas, martillos y equipamiento para labores de apoyo.',
    apiCategoria: 'HERRAMIENTAS',
  },
  {
    id: 'utiles-aseo',
    label: 'Útiles de aseo',
    description: 'Jabón, pañales e higiene personal.',
    apiCategoria: 'ARTICULOS_HIGIENE',
  },
  {
    id: 'alojamiento-enseres',
    label: 'Alojamiento y enseres',
    description: 'Frazadas, carpas y enseres para refugio temporal.',
    apiCategoria: 'MATERIALES',
  },
];

export function getCategoryById(id: DonationCategoryId): DonationCategoryConfig {
  const found = DONATION_CATEGORIES.find((c) => c.id === id);
  if (!found) {
    throw new Error(`Categoría desconocida: ${id}`);
  }
  return found;
}
