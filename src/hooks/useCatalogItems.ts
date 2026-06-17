import { useQuery } from '@tanstack/react-query';
import { getCatalogItems } from '@/services/catalog.service';
import type { CategoriaInventario } from '@/types/catalog';

export const CATALOG_QUERY_KEYS = {
  items: (categoria?: CategoriaInventario) => ['catalogo', 'items', categoria ?? 'all'] as const,
};

export const useCatalogItems = (categoria?: CategoriaInventario) =>
  useQuery({
    queryKey: CATALOG_QUERY_KEYS.items(categoria),
    queryFn: () => getCatalogItems(categoria),
    staleTime: 5 * 60_000,
  });
