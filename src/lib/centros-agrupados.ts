import { etiquetaEmergenciaPorId, type Emergencia } from '@/services/emergency.service';
import type { CentroDetalle } from '@/types/resources';

/** Clave del grupo de centros sin emergencia activa asociada. */
export const GRUPO_SIN_EMERGENCIA = '__sin_emergencia__';

export interface GrupoCentros {
  /** Clave única del grupo (emergenciaId o GRUPO_SIN_EMERGENCIA). */
  key: string;
  /** Etiqueta legible del encabezado del grupo. */
  etiqueta: string;
  /** Centros pertenecientes al grupo. */
  centros: CentroDetalle[];
}

/**
 * Agrupa centros por emergencia asociada. Los centros sin emergencia (o con una
 * emergencia que ya no está activa) quedan en un grupo final "Centros sin emergencia activa".
 */
export function agruparCentrosPorEmergencia(
  centros: CentroDetalle[],
  emergencias: Emergencia[]
): GrupoCentros[] {
  const activasPorId = new Map(emergencias.map((e) => [e.id, e]));
  const grupos = new Map<string, GrupoCentros>();

  for (const centro of centros) {
    const esActiva = centro.emergenciaId ? activasPorId.has(centro.emergenciaId) : false;
    const key = esActiva ? (centro.emergenciaId as string) : GRUPO_SIN_EMERGENCIA;
    if (!grupos.has(key)) {
      grupos.set(key, {
        key,
        etiqueta: esActiva
          ? etiquetaEmergenciaPorId(centro.emergenciaId, emergencias) ?? 'Emergencia'
          : 'Centros sin emergencia activa',
        centros: [],
      });
    }
    grupos.get(key)!.centros.push(centro);
  }

  // Grupos de emergencias primero (ordenados por etiqueta), "sin emergencia" al final.
  const conEmergencia = [...grupos.values()]
    .filter((g) => g.key !== GRUPO_SIN_EMERGENCIA)
    .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta));
  const sinEmergencia = grupos.get(GRUPO_SIN_EMERGENCIA);
  return sinEmergencia ? [...conEmergencia, sinEmergencia] : conEmergencia;
}
