import apiClient from './apiClient';
import type { ItemCatalogo } from '@/types/catalog';

/**
 * GET /catalogo/items — catálogo público ms-resources.
 * Trae el catálogo completo; el filtrado por categoría se hace en cliente con
 * `codigoCategoria` (el backend filtra por `categoriaId` UUID, no por el enum).
 */
export const getCatalogItems = async (): Promise<ItemCatalogo[]> => {
  const res = await apiClient.get<ItemCatalogo[]>('/catalogo/items');
  return res.data;
};
