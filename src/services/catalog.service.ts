import apiClient from './apiClient';
import type { CategoriaInventario, ItemCatalogo } from '@/types/catalog';

/** GET /catalogo/items — catálogo público ms-resources */
export const getCatalogItems = async (
  categoria?: CategoriaInventario
): Promise<ItemCatalogo[]> => {
  const res = await apiClient.get<ItemCatalogo[]>('/catalogo/items', {
    params: categoria ? { categoria } : undefined,
  });
  return res.data;
};
