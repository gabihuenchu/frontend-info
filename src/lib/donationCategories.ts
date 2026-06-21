import type { CategoriaInventario } from '@/types/catalog';

export type DonationCategoryId =
  | 'alimentos-no-perecederos'
  | 'aseo-personal'
  | 'ropa-calzado'
  | 'ropa-cama'
  | 'articulos-hogar'
  | 'herramientas-insumos'
  | 'alimentos-mascotas';

export interface DonationCategoryConfig {
  id: DonationCategoryId;
  label: string;
  description: string;
  apiCategoria: CategoriaInventario;
}

/** Categorías UI → enum del catálogo ms-resources */
export const DONATION_CATEGORIES: DonationCategoryConfig[] = [
  {
    id: 'alimentos-no-perecederos',
    label: 'Alimentos no perecederos',
    description:
      'Legumbres, arroz, fideos, aceite, enlatados (con abrelatas), leche en polvo, azúcar y agua embotellada.',
    apiCategoria: 'ALIMENTOS',
  },
  {
    id: 'aseo-personal',
    label: 'Artículos de aseo personal',
    description:
      'Jabón, champú, desodorante, pasta y cepillo de dientes, toallas higiénicas, pañales (niños y adultos), papel higiénico y alcohol gel.',
    apiCategoria: 'ARTICULOS_HIGIENE',
  },
  {
    id: 'ropa-calzado',
    label: 'Ropa y calzado',
    description:
      'En la gran mayoría de emergencias, solo se solicita ropa interior nueva, primera capa y calzado en excelente estado.',
    apiCategoria: 'ROPA',
  },
  {
    id: 'ropa-cama',
    label: 'Ropa de cama',
    description: 'Frazadas, sábanas, plumones y toallas (idealmente nuevos o en perfectas condiciones).',
    apiCategoria: 'MATERIALES',
  },
  {
    id: 'articulos-hogar',
    label: 'Artículos para el hogar',
    description:
      'Vajilla, cubiertos, ollas, termos y artículos de limpieza (cloro, detergente, bolsas de basura).',
    apiCategoria: 'ARTICULOS_VARIOS',
  },
  {
    id: 'herramientas-insumos',
    label: 'Herramientas e insumos',
    description:
      'Palas, rastrillos, guantes de trabajo, mascarillas (N95), carretillas y artículos de remoción de escombros.',
    apiCategoria: 'HERRAMIENTAS',
  },
  {
    id: 'alimentos-mascotas',
    label: 'Alimentos para mascotas',
    description: 'Alimento para perros y gatos, arena sanitaria y snacks.',
    apiCategoria: 'MASCOTAS',
  },
];

export function getCategoryById(id: DonationCategoryId): DonationCategoryConfig {
  const found = DONATION_CATEGORIES.find((c) => c.id === id);
  if (!found) {
    throw new Error(`Categoría desconocida: ${id}`);
  }
  return found;
}
