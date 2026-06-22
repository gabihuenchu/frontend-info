import apiClient from './apiClient';
import type { CentroAcopioLogistica, InventarioCategoriaResponse } from '@/types/resources';
import type { PageResponse } from '@/services/emergency.service';

interface CentroApiDto {
  id: string;
  nombre: string;
  direccion: string;
  comuna: string;
  region: string;
  estado: string;
  coordenadas?: { coordinates?: [number, number] };
}

function mapCentro(dto: CentroApiDto): CentroAcopioLogistica {
  const [lng, lat] = dto.coordenadas?.coordinates ?? [];
  return {
    id: dto.id,
    nombre: dto.nombre,
    direccion: dto.direccion,
    ciudad: dto.comuna,
    region: dto.region,
    estado: dto.estado,
    latitud: lat,
    longitud: lng,
  };
}

/** Lista centros de acopio (gateway: /centros-acopio → ms-resources /centros). */
export async function listarCentrosLogistica(): Promise<CentroAcopioLogistica[]> {
  const res = await apiClient.get<PageResponse<CentroApiDto>>('/centros-acopio', {
    params: { page: 0, size: 200 },
  });
  const content = res.data?.content;
  return Array.isArray(content) ? content.map(mapCentro) : [];
}

/** Inventario por categoría del centro de acopio origen. */
export async function listarInventarioCentro(
  centroId: string
): Promise<InventarioCategoriaResponse[]> {
  const res = await apiClient.get<InventarioCategoriaResponse[]>(
    `/centros-acopio/${centroId}/inventario`
  );
  return Array.isArray(res.data) ? res.data : [];
}
