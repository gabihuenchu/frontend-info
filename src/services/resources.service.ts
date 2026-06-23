import apiClient from './apiClient';
import type {
  CentroAcopioLogistica,
  CentroDetalle,
  Categoria,
  InventarioItem,
  KpisInventario,
  MovimientoInventarioResultado,
  OperadorCentro,
  ResumenCategoria,
  SugerenciaRedistribucion,
  ActualizarCentroPayload,
  AsignarOperadorPayload,
  CrearCentroPayload,
  MovimientoInventarioPayload,
  UmbralesPayload,
} from '@/types/resources';
import type { CategoriaInventario } from '@/types/resources';
import type { PageResponse } from '@/services/emergency.service';

interface CentroApiDto {
  id: string;
  nombre: string;
  direccion: string | null;
  comuna: string | null;
  region: string | null;
  estado: string;
  capacidad?: number | null;
  horario?: string | null;
  emergenciaId?: string | null;
  creadoPorUsuarioId?: string | null;
  creadoEn?: string;
  actualizadoEn?: string;
  coordenadas?: { coordinates?: [number, number] };
}

function mapCentro(dto: CentroApiDto): CentroAcopioLogistica {
  const [lng, lat] = dto.coordenadas?.coordinates ?? [];
  return {
    id: dto.id,
    nombre: dto.nombre,
    direccion: dto.direccion ?? '',
    ciudad: dto.comuna ?? '',
    region: dto.region ?? '',
    estado: dto.estado,
    emergenciaId: dto.emergenciaId ?? null,
    latitud: lat,
    longitud: lng,
  };
}

function mapCentroDetalle(dto: CentroApiDto): CentroDetalle {
  const [lng, lat] = dto.coordenadas?.coordinates ?? [];
  return {
    id: dto.id,
    nombre: dto.nombre,
    direccion: dto.direccion ?? null,
    region: dto.region ?? null,
    comuna: dto.comuna ?? null,
    capacidad: dto.capacidad ?? null,
    horario: dto.horario ?? null,
    estado: (dto.estado as CentroDetalle['estado']) ?? 'ACTIVO',
    emergenciaId: dto.emergenciaId ?? null,
    creadoPorUsuarioId: dto.creadoPorUsuarioId ?? null,
    latitud: lat,
    longitud: lng,
    creadoEn: dto.creadoEn ?? '',
    actualizadoEn: dto.actualizadoEn ?? '',
  };
}

/** Lista centros de acopio (gateway: /centros-acopio → ms-resources /centros). */
export async function listarCentrosLogistica(): Promise<CentroAcopioLogistica[]> {
  // size <= 100: el backend valida @Max(100) sobre el parametro size (ControladorCentros.listar).
  const res = await apiClient.get<PageResponse<CentroApiDto>>('/centros-acopio', {
    params: { page: 0, size: 100 },
  });
  const content = res.data?.content;
  return Array.isArray(content) ? content.map(mapCentro) : [];
}

// ─── Centros (detalle completo para gestión) ───────────────────────────────────

/** Lista centros con detalle completo. Filtro opcional por emergencia. */
export async function listarCentrosDetalle(emergenciaId?: string): Promise<CentroDetalle[]> {
  // size <= 100: el backend valida @Max(100) sobre el parametro size (ControladorCentros.listar).
  const res = await apiClient.get<PageResponse<CentroApiDto>>('/centros-acopio', {
    params: { page: 0, size: 100, ...(emergenciaId ? { emergenciaId } : {}) },
  });
  const content = res.data?.content;
  return Array.isArray(content) ? content.map(mapCentroDetalle) : [];
}

export async function obtenerCentro(centroId: string): Promise<CentroDetalle> {
  const res = await apiClient.get<CentroApiDto>(`/centros-acopio/${centroId}`);
  return mapCentroDetalle(res.data);
}

/** POST /centros (CENTRO_CREAR). Inicializa inventario en 0 en el backend. */
export async function crearCentro(data: CrearCentroPayload): Promise<CentroDetalle> {
  const res = await apiClient.post<CentroApiDto>('/centros-acopio', data);
  return mapCentroDetalle(res.data);
}

/** PATCH /centros/{id} (CENTRO_GESTIONAR). */
export async function actualizarCentro(
  centroId: string,
  data: ActualizarCentroPayload
): Promise<CentroDetalle> {
  const res = await apiClient.patch<CentroApiDto>(`/centros-acopio/${centroId}`, data);
  return mapCentroDetalle(res.data);
}

/** DELETE /centros/{id} (CENTRO_GESTIONAR) — borrado lógico: marca el centro como CERRADO. */
export async function eliminarCentro(centroId: string): Promise<void> {
  await apiClient.delete(`/centros-acopio/${centroId}`);
}

// ─── Inventario por item ────────────────────────────────────────────────────────

/** GET /centros/{id}/inventario — inventario a nivel de ítem de catálogo. */
export async function listarInventarioItems(centroId: string): Promise<InventarioItem[]> {
  const res = await apiClient.get<InventarioItem[]>(`/centros-acopio/${centroId}/inventario`);
  return Array.isArray(res.data) ? res.data : [];
}

/** GET /centros/{id}/inventario/resumen-categorias */
export async function listarResumenCategorias(centroId: string): Promise<ResumenCategoria[]> {
  const res = await apiClient.get<ResumenCategoria[]>(
    `/centros-acopio/${centroId}/inventario/resumen-categorias`
  );
  return Array.isArray(res.data) ? res.data : [];
}

/** POST /centros/{id}/inventario/movimientos (INVENTARIO_GESTIONAR). */
export async function registrarMovimiento(
  centroId: string,
  data: MovimientoInventarioPayload
): Promise<MovimientoInventarioResultado> {
  const res = await apiClient.post<MovimientoInventarioResultado>(
    `/centros-acopio/${centroId}/inventario/movimientos`,
    data
  );
  return res.data;
}

/** PATCH /centros/{id}/inventario/umbrales (INVENTARIO_UMBRALES, solo ADMIN). */
export async function actualizarUmbrales(
  centroId: string,
  data: UmbralesPayload
): Promise<InventarioItem> {
  const res = await apiClient.patch<InventarioItem>(
    `/centros-acopio/${centroId}/inventario/umbrales`,
    data
  );
  return res.data;
}

// ─── Operadores del centro ──────────────────────────────────────────────────────

/** GET /centros/{id}/operadores (CENTRO_GESTIONAR). */
export async function listarOperadores(centroId: string): Promise<OperadorCentro[]> {
  const res = await apiClient.get<OperadorCentro[]>(`/centros-acopio/${centroId}/operadores`);
  return Array.isArray(res.data) ? res.data : [];
}

/** POST /centros/{id}/operadores (CENTRO_ASIGNAR_OPERADOR). */
export async function asignarOperador(
  centroId: string,
  data: AsignarOperadorPayload
): Promise<OperadorCentro> {
  const res = await apiClient.post<OperadorCentro>(`/centros-acopio/${centroId}/operadores`, data);
  return res.data;
}

// ─── KPIs y sugerencias ──────────────────────────────────────────────────────────

/** GET /inventario/kpis (autenticado). */
export async function obtenerKpisInventario(): Promise<KpisInventario> {
  const res = await apiClient.get<KpisInventario>('/inventario/kpis');
  return res.data;
}

/** GET /inventario/sugerencias (INVENTARIO_SUGERENCIAS). */
export async function obtenerSugerencias(
  categoria: CategoriaInventario,
  limite = 10
): Promise<SugerenciaRedistribucion[]> {
  const res = await apiClient.get<SugerenciaRedistribucion[]>('/inventario/sugerencias', {
    params: { categoria, limite },
  });
  return Array.isArray(res.data) ? res.data : [];
}

// ─── Categorías ──────────────────────────────────────────────────────────────────

/** GET /categorias — categorías maestras activas (pública en el MS). */
export async function listarCategorias(): Promise<Categoria[]> {
  const res = await apiClient.get<Categoria[]>('/categorias');
  return Array.isArray(res.data) ? res.data : [];
}
