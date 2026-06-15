/**
 * Tipos para el dominio de Emergencias
 * MS-2: Coordinación de Emergencias
 */

export type TipoEmergencia = 
  | 'TERREMOTO' 
  | 'TSUNAMI' 
  | 'INCENDIO' 
  | 'INUNDACION' 
  | 'ERUPCION_VOLCANICA' 
  | 'ALUVION'
  | 'OTRO';

export type NivelSeveridad = 
  | 'BAJA' 
  | 'MEDIA' 
  | 'ALTA' 
  | 'CRITICA';

export type EstadoEmergencia = 
  | 'ACTIVA' 
  | 'CONTROLADA' 
  | 'FINALIZADA';

export interface CoordenadaDto {
  latitud: number;
  longitud: number;
}

export interface Emergencia {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoEmergencia;
  severidad: NivelSeveridad;
  estado: EstadoEmergencia;
  region: string;
  comuna: string;
  latitud: number;
  longitud: number;
  afectados?: number;
  fechaCreacion: string;
  fechaUltimaActualizacion?: string;
  usuarioCreador?: string;
}

export interface CrearEmergenciaRequest {
  tipo: TipoEmergencia;
  severidad: NivelSeveridad;
  region: string;
  epicentro: CoordenadaDto;
  zonaImpacto: CoordenadaDto[];
}

export interface ActualizarEstadoRequest {
  estado: EstadoEmergencia;
}

export interface MapaCoordinate {
  lat: number;
  lng: number;
}

export const REGIONS_CHILE: Record<string, MapaCoordinate> = {
  'Arica y Parinacota': { lat: -18.3, lng: -70.3 },
  'Tarapacá': { lat: -20.25, lng: -69.5 },
  'Antofagasta': { lat: -23.65, lng: -70.4 },
  'Atacama': { lat: -27.36, lng: -70.3 },
  'Coquimbo': { lat: -30.025, lng: -71.54 },
  'Valparaíso': { lat: -32.76, lng: -71.41 },
  'Metropolitana de Santiago': { lat: -33.4489, lng: -70.6693 },
  'Libertador General Bernardo O\'Higgins': { lat: -34.17, lng: -71.54 },
  'Maule': { lat: -35.41, lng: -71.54 },
  'Ñuble': { lat: -36.73, lng: -71.94 },
  'Biobío': { lat: -37.13, lng: -72.11 },
  'Los Ríos': { lat: -39.82, lng: -72.72 },
  'Los Lagos': { lat: -41.77, lng: -72.3 },
  'Aysén': { lat: -45.57, lng: -71.94 },
  'Magallanes y de la Antártica Chilena': { lat: -53.16, lng: -70.91 }
};

export const TIPO_EMERGENCIA_LABELS: Record<TipoEmergencia, string> = {
  'TERREMOTO': '🌍 Terremoto',
  'TSUNAMI': '🌊 Tsunami',
  'INCENDIO': '🔥 Incendio',
  'INUNDACION': '💧 Inundación',
  'ERUPCION_VOLCANICA': '🌋 Erupción Volcánica',
  'ALUVION': '⛰️ Aluvión',
  'OTRO': '⚠️ Otro'
};

export const SEVERIDAD_COLORS: Record<NivelSeveridad, string> = {
  'BAJA': '#FFA500',
  'MEDIA': '#FF6B6B',
  'ALTA': '#DC143C',
  'CRITICA': '#8B0000'
};

export const SEVERIDAD_LABELS: Record<NivelSeveridad, string> = {
  'BAJA': 'Baja',
  'MEDIA': 'Media',
  'ALTA': 'Alta',
  'CRITICA': 'Crítica'
};

export const ESTADO_LABELS: Record<EstadoEmergencia, string> = {
  'ACTIVA': 'Activa',
  'CONTROLADA': 'Controlada',
  'FINALIZADA': 'Finalizada'
};
