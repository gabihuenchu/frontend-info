import { useQuery } from '@tanstack/react-query';
import { getCatalogItems } from '@/services/catalog.service';

export const CATALOG_QUERY_KEYS = {
  items: () => ['catalogo', 'items', 'all'] as const,
};

/** Catálogo completo de ítems. El filtrado por categoría se hace en cliente. */
export const useCatalogItems = () =>
  useQuery({
    queryKey: CATALOG_QUERY_KEYS.items(),
    queryFn: () => getCatalogItems(),
    staleTime: 5 * 60_000,
  });
