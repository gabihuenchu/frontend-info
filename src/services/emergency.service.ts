/**
 * Servicio de emergencias — API Gateway (/emergencias/* → ms-emergencies /emergencies/*)
 * Contrato: document/ms-analisis (DeclararEmergenciaRequest, EmergenciaResponse, GeoJSON).
 */

import apiClient from './apiClient';

// ─── Tipos API (ms-emergencies) ───────────────────────────────────────────────

export type TipoEmergenciaApi =
  | 'TERREMOTO'
  | 'TSUNAMI'
  | 'INCENDIO'
  | 'INUNDACION'
  | 'ERUPCION'
  | 'ALUVION';

export type SeveridadEmergenciaApi = 'BAJA' | 'MEDIA' | 'ALTA' | 'CATASTROFICA';

export type EstadoEmergenciaApi = 'ACTIVA' | 'CONTROLADA' | 'FINALIZADA';

// ─── Tipos Anuncios (Backend) ─────────────────────────────────────────────────

export type SeveridadAnuncio = 'INFORMATIVO' | 'IMPORTANTE' | 'URGENTE' | 'EMERGENCIA';
export type AlcanceAnuncio = 'NACIONAL' | 'REGIONAL' | 'COMUNAL';

export interface GeoJsonPointDto {
  type: 'Point';
  coordinates: [number, number];
}

export interface GeoJsonPolygonDto {
  type: 'Polygon';
  coordinates: [number, number][][];
}

export interface EmergenciaResponseDto {
  id: string;
  tipo: TipoEmergenciaApi;
  severidad: SeveridadEmergenciaApi;
  region: string;
  estado: EstadoEmergenciaApi;
  coordenadasEpicentro: GeoJsonPointDto | null;
  zonaImpacto: GeoJsonPolygonDto | null;
  declaradaPorUsuarioId: string;
  declaradaEn: string;
  centrosAcopio?: CentroAcopioEmergenciaResponseDto[];
  procesamientoColaEmergenciaCreadaEn?: string | null;
  actualizadaEn: string;
}

export interface EmergenciaGeoJsonFeature {
  type: 'Feature';
  geometry: GeoJsonPolygonDto;
  properties: {
    id: string;
    tipo: TipoEmergenciaApi;
    severidad: SeveridadEmergenciaApi;
    region: string;
    estado: EstadoEmergenciaApi;
    declaradaEn: string;
  };
}

export interface EmergenciasGeoJsonCollection {
  type: 'FeatureCollection';
  features: EmergenciaGeoJsonFeature[];
}

// ─── Tipos Centro Acopio Emergencia Response ──────────────────────────────────

export interface CentroAcopioEmergenciaResponseDto {
  id: string;
  nombre: string;
  ubicacion: GeoJsonPointDto | null;
  capacidadEstimada: number | null;
}

// ─── Tipo Anuncio Response (Backend) ──────────────────────────────────────────

export interface AnuncioResponseDto {
  id: string;
  emergenciaId: string;
  autorUsuarioId: string;
  titulo: string;
  contenido: string;
  severidad: SeveridadAnuncio;
  alcance: AlcanceAnuncio;
  region: string | null;
  vigenteDesde: string;
  vigenteHasta: string | null;
  creadoEn: string;
}

export interface ActualizarAnuncioRequest {
  titulo: string;
  contenido: string;
  severidad: SeveridadAnuncio;
  alcance: AlcanceAnuncio;
  region?: string | null;
  vigenteHasta?: string | null;
}

/** Spring Page<T> response wrapper */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ─── Tipos UI ─────────────────────────────────────────────────────────────────

/** Etiquetas de tipo en español (clave = valor API) */
export type TipoEmergenciaUi =
  | 'TERREMOTO'
  | 'TSUNAMI'
  | 'INCENDIO'
  | 'INUNDACION'
  | 'ERUPCION'
  | 'ALUVION';

/** Alias para componentes que importaban el nombre anterior */
export type TipoEmergencia = TipoEmergenciaUi;

export type NivelAlerta = 'ALTA' | 'MEDIA' | 'BAJA';
export type NivelSeveridad = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
/** Estados del dominio backend */
export type EstadoEmergencia = 'ACTIVA' | 'CONTROLADA' | 'FINALIZADA';

export interface Emergencia {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoEmergenciaUi;
  severidad: NivelSeveridad;
  nivel?: NivelAlerta;
  estado: EstadoEmergencia;
  region: string;
  comunas?: string;
  comuna?: string;
  latitud: number;
  longitud: number;
  afectados?: number;
  personasAfectadas?: number;
  comunasAfectadas?: number;
  hectareasQuemadas?: number;
  iniciada?: string;
  createdAt?: string;
  updatedAt?: string;
  zonaImpacto?: GeoJsonPolygonDto | null;
  coordenadasEpicentro?: GeoJsonPointDto | null;
}

export interface CentroAcopio {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  region: string;
  distanciaKm?: number;
  capacidad?: string;
  estado: 'Abierto' | 'En evaluación' | 'Cerrado';
  latitud?: number;
  longitud?: number;
}

export interface CoordenadaDto {
  longitud: number;
  latitud: number;
}

/** Coincide exactamente con DeclararEmergenciaRequest del backend */
export interface SolicitudCentroAcopioRequest {
  nombre: string;
  ubicacion: CoordenadaDto;
  capacidadEstimada?: number;
}

export interface CrearEmergenciaRequest {
  tipo: TipoEmergenciaApi;
  severidad: SeveridadEmergenciaApi;
  region: string;
  epicentro: CoordenadaDto;
  zonaImpacto: CoordenadaDto[] | null;
  centrosAcopio?: SolicitudCentroAcopioRequest[];
}

export interface ActualizarEstadoRequest {
  nuevoEstado: EstadoEmergenciaApi;
}

export interface CrearCentroAcopioRequest {
  nombre: string;
  direccion: string;
  ciudad: string;
  region: string;
  latitud?: number;
  longitud?: number;
  capacidad?: string;
  estado?: 'Abierto' | 'En evaluación' | 'Cerrado';
}

export interface KpiData {
  totalActivas: number;
  totalCriticas: number;
  totalAfectados: number;
  regionesMasAfectadas: string[];
}

// ─── Mapeo API ↔ UI ───────────────────────────────────────────────────────────

const TIPO_API_A_UI: Record<TipoEmergenciaApi, TipoEmergenciaUi> = {
  TERREMOTO: 'TERREMOTO',
  TSUNAMI: 'TSUNAMI',
  INCENDIO: 'INCENDIO',
  INUNDACION: 'INUNDACION',
  ERUPCION: 'ERUPCION',
  ALUVION: 'ALUVION',
};

export function mapTipoUiABackend(tipoUi: string): TipoEmergenciaApi {
  const m: Record<string, TipoEmergenciaApi> = {
    TERREMOTO: 'TERREMOTO',
    TSUNAMI: 'TSUNAMI',
    INCENDIO: 'INCENDIO',
    INUNDACION: 'INUNDACION',
    ERUPCION: 'ERUPCION',
    ERUPCION_VOLCANICA: 'ERUPCION',
    ALUVION: 'ALUVION',
    Terremoto: 'TERREMOTO',
    SISMO: 'TERREMOTO',
    'Alerta de Tsunami': 'TSUNAMI',
    'Incendios Forestales': 'INCENDIO',
    Inundaciones: 'INUNDACION',
    'Erupción Volcánica': 'ERUPCION',
    Aluvión: 'ALUVION',
    INFRAESTRUCTURA: 'INCENDIO',
    MAREJADA: 'TSUNAMI',
  };
  return m[tipoUi] ?? 'INCENDIO';
}

function severidadApiAUi(s: SeveridadEmergenciaApi): NivelSeveridad {
  if (s === 'CATASTROFICA') return 'CRITICA';
  return s as NivelSeveridad;
}

export function severidadUiAApi(s: NivelSeveridad): SeveridadEmergenciaApi {
  if (s === 'CRITICA') return 'CATASTROFICA';
  return s as SeveridadEmergenciaApi;
}

function estadoApiAUi(e: EstadoEmergenciaApi): EstadoEmergencia {
  return e;
}

export function mapEmergenciaResponse(dto: EmergenciaResponseDto): Emergencia {
  const [lng, lat] = dto.coordenadasEpicentro?.coordinates ?? [0, 0];
  const tipoUi = TIPO_API_A_UI[dto.tipo] ?? dto.tipo;
  return {
    id: dto.id,
    titulo: dto.region,
    descripcion: '',
    tipo: tipoUi,
    severidad: severidadApiAUi(dto.severidad),
    estado: estadoApiAUi(dto.estado),
    region: dto.region,
    latitud: lat,
    longitud: lng,
    iniciada: dto.declaradaEn,
    createdAt: dto.declaradaEn,
    updatedAt: dto.actualizadaEn,
    zonaImpacto: dto.zonaImpacto,
    coordenadasEpicentro: dto.coordenadasEpicentro,
  };
}

/** Mínimo de vértices únicos antes de cerrar el anillo (4 coordenadas totales con cierre). */
export const MIN_VERTICES_ZONA_IMPACTO = 3;

/** Cierra el anillo del polígono (primer punto = último) para PostGIS / JTS */
export function cerrarAnilloZona(coords: CoordenadaDto[]): CoordenadaDto[] {
  if (coords.length === 0) return coords;
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first.longitud === last.longitud && first.latitud === last.latitud) return coords;
  return [...coords, { ...first }];
}

/**
 * Valida y cierra la zona para DeclararEmergenciaRequest.
 * El backend exige ≥ 4 CoordenadaDto con anillo cerrado (mín. 3 vértices únicos).
 */
export function prepararZonaImpactoParaApi(
  puntos: CoordenadaDto[]
): { ring: CoordenadaDto[]; epicentro: CoordenadaDto } | null {
  if (puntos.length < MIN_VERTICES_ZONA_IMPACTO) return null;
  const ring = cerrarAnilloZona(puntos);
  if (ring.length < 4) return null;
  return { ring, epicentro: centroidEpicentro(ring) };
}

export function latLngRingFromGeoJson(
  polygon: GeoJsonPolygonDto | null | undefined
): Array<{ lat: number; lng: number }> {
  const ring = polygon?.coordinates?.[0];
  if (!ring?.length) return [];
  return ring.map(([lng, lat]) => ({ lat, lng }));
}

export function centroidEpicentro(ring: CoordenadaDto[]): CoordenadaDto {
  const open = ring.length >= 2 &&
    ring[0].longitud === ring[ring.length - 1].longitud &&
    ring[0].latitud === ring[ring.length - 1].latitud
    ? ring.slice(0, -1)
    : ring;
  const n = open.length || 1;
  let lng = 0;
  let lat = 0;
  for (const c of open) {
    lng += c.longitud;
    lat += c.latitud;
  }
  return { longitud: lng / n, latitud: lat / n };
}

// ─── Emergencias HTTP ─────────────────────────────────────────────────────────

export const getEmergenciasActivas = async (): Promise<Emergencia[]> => {
  const res = await apiClient.get<EmergenciaResponseDto[]>('/emergencias/activas');
  return res.data.map(mapEmergenciaResponse);
};

export const getEmergenciasGeoJson = async (): Promise<EmergenciasGeoJsonCollection> => {
  const res = await apiClient.get<EmergenciasGeoJsonCollection>('/emergencias/activas/geojson');
  return res.data;
};

export const getAllEmergencias = async (): Promise<Emergencia[]> => getEmergenciasActivas();

export const getEmergenciaById = async (id: string): Promise<Emergencia> => {
  const res = await apiClient.get<EmergenciaResponseDto>(`/emergencias/${id}`);
  return mapEmergenciaResponse(res.data);
};

export const createEmergencia = async (data: CrearEmergenciaRequest): Promise<Emergencia> => {
  const res = await apiClient.post<EmergenciaResponseDto>('/emergencias', data);
  return mapEmergenciaResponse(res.data);
};

export const updateEstadoEmergencia = async (
  id: string,
  data: ActualizarEstadoRequest
): Promise<Emergencia> => {
  const res = await apiClient.patch<EmergenciaResponseDto>(`/emergencias/${id}/estado`, data);
  return mapEmergenciaResponse(res.data);
};

/** El backend no expone DELETE: se marca como FINALIZADA (cierre operativo). */
export const deleteEmergencia = async (id: string): Promise<void> => {
  await updateEstadoEmergencia(id, { nuevoEstado: 'FINALIZADA' });
};

// ─── Centros de acopio ────────────────────────────────────────────────────────
// El MS de recursos no está integrado en el gateway aún; no llamar a /centros-acopio por defecto.
// Para reactivar el cliente cuando exista el servicio: NEXT_PUBLIC_ENABLE_CENTROS_ACOPIO=true

export function isCentrosAcopioApiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_CENTROS_ACOPIO === 'true';
}

export const getCentrosAcopio = async (): Promise<CentroAcopio[]> => {
  if (!isCentrosAcopioApiEnabled()) return [];
  const res = await apiClient.get<CentroAcopio[]>('/centros-acopio');
  return res.data;
};

export const getCentrosCercanos = async (
  lat: number,
  lng: number,
  radioKm = 20
): Promise<CentroAcopio[]> => {
  if (!isCentrosAcopioApiEnabled()) return [];
  const res = await apiClient.get<CentroAcopio[]>('/centros-acopio/cercanos', {
    params: { lat, lng, radio: radioKm },
  });
  return res.data;
};

function rejectCentrosDeshabilitados(): never {
  throw new Error(
    'El módulo de centros de acopio no está disponible. Cuando el microservicio esté listo, define NEXT_PUBLIC_ENABLE_CENTROS_ACOPIO=true.'
  );
}

export const createCentroAcopio = async (
  data: CrearCentroAcopioRequest
): Promise<CentroAcopio> => {
  if (!isCentrosAcopioApiEnabled()) rejectCentrosDeshabilitados();
  const res = await apiClient.post<CentroAcopio>('/centros-acopio', data);
  return res.data;
};

export const updateCentroAcopio = async (
  id: string,
  data: Partial<CrearCentroAcopioRequest>
): Promise<CentroAcopio> => {
  if (!isCentrosAcopioApiEnabled()) rejectCentrosDeshabilitados();
  const res = await apiClient.patch<CentroAcopio>(`/centros-acopio/${id}`, data);
  return res.data;
};

export const deleteCentroAcopio = async (id: string): Promise<void> => {
  if (!isCentrosAcopioApiEnabled()) rejectCentrosDeshabilitados();
  await apiClient.delete(`/centros-acopio/${id}`);
};

// ─── Anuncios / Notificaciones ────────────────────────────────────────────────

/** Obtiene los anuncios vigentes (paginados). El backend ordena por severidad desc + vigenteDesde */
export const getAnuncios = async (page = 0, size = 50): Promise<PageResponse<AnuncioResponseDto>> => {
  const res = await apiClient.get<PageResponse<AnuncioResponseDto>>('/anuncios', {
    params: { page, size },
  });
  return res.data;
};

export const updateAnuncio = async (
  id: string,
  data: ActualizarAnuncioRequest
): Promise<AnuncioResponseDto> => {
  const res = await apiClient.patch<AnuncioResponseDto>(`/anuncios/${id}`, data);
  return res.data;
};

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export const calculateKpis = (emergencias: Emergencia[]): KpiData => ({
  totalActivas: emergencias.filter((e) => e.estado === 'ACTIVA').length,
  totalCriticas: emergencias.filter((e) => e.severidad === 'CRITICA' || e.severidad === 'ALTA').length,
  totalAfectados: emergencias.reduce(
    (sum, e) => sum + (e.afectados ?? e.personasAfectadas ?? 0),
    0
  ),
  regionesMasAfectadas: Array.from(new Set(emergencias.map((e) => e.region))),
});
