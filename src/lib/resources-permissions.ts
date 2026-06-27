import { tienePermiso, normalizarRoles, type PerfilConPermisos } from '@/lib/logistics-permissions';

/**
 * Permisos de ms-resources (centros e inventario).
 *
 * Nota: ms-identity siembra los permisos con nombres distintos a los que valida ms-resources
 * (p. ej. CENTRO_EDITAR vs CENTRO_GESTIONAR). Aceptamos ambos nombres + un fallback por rol
 * para que el gating del frontend coincida con lo que el backend realmente autoriza.
 */
export const PERMISOS_RECURSOS = {
  CENTRO_CREAR: 'CENTRO_CREAR',
  CENTRO_GESTIONAR: 'CENTRO_GESTIONAR',
  CENTRO_EDITAR: 'CENTRO_EDITAR',
  CENTRO_ASIGNAR_OPERADOR: 'CENTRO_ASIGNAR_OPERADOR',
  INVENTARIO_GESTIONAR: 'INVENTARIO_GESTIONAR',
  INVENTARIO_EDITAR: 'INVENTARIO_EDITAR',
  INVENTARIO_UMBRALES: 'INVENTARIO_UMBRALES',
  UMBRAL_CONFIGURAR: 'UMBRAL_CONFIGURAR',
  INVENTARIO_SUGERENCIAS: 'INVENTARIO_SUGERENCIAS',
  CATEGORIA_GESTIONAR: 'CATEGORIA_GESTIONAR',
  CATALOGO_GESTIONAR: 'CATALOGO_GESTIONAR',
} as const;

/** Alias de roles emitidos en ingles por Firebase hacia el codigo interno en espanol. */
const ALIAS_ROL: Record<string, string> = {
  ADMIN: 'ADMINISTRADOR',
  AUTHORITY: 'AUTORIDAD',
  OPERATOR: 'OPERADOR',
  CITIZEN: 'PARTICULAR',
  VOLUNTEER: 'VOLUNTARIO',
};

/** ¿El perfil tiene alguno de los roles indicados? (normaliza mayúsculas y alias en inglés). */
function incluyeRol(profile: PerfilConPermisos | null | undefined, ...roles: string[]): boolean {
  const objetivo = new Set(roles.map((r) => r.toUpperCase()));
  return normalizarRoles(profile).some((r) => {
    const norm = r.toUpperCase();
    return objetivo.has(norm) || objetivo.has(ALIAS_ROL[norm] ?? norm);
  });
}

/** ¿El perfil tiene alguno de los permisos indicados? */
function tieneAlguno(profile: PerfilConPermisos | null | undefined, ...permisos: string[]): boolean {
  return permisos.some((p) => tienePermiso(profile, p));
}

/** Permisos de ms-citizen (necesidades y donaciones). */
export const PERMISOS_CIUDADANA = {
  NECESIDAD_GESTIONAR: 'NECESIDAD_GESTIONAR',
  DONACION_CONFIRMAR: 'DONACION_CONFIRMAR',
  DONACION_REALIZAR: 'DONACION_REALIZAR',
} as const;

/** ¿El perfil puede ver/gestionar centros de acopio? */
export function puedeGestionarCentros(profile: PerfilConPermisos | null | undefined): boolean {
  return (
    tieneAlguno(
      profile,
      PERMISOS_RECURSOS.CENTRO_CREAR,
      PERMISOS_RECURSOS.CENTRO_GESTIONAR,
      PERMISOS_RECURSOS.CENTRO_EDITAR,
      PERMISOS_RECURSOS.INVENTARIO_GESTIONAR,
      PERMISOS_RECURSOS.INVENTARIO_EDITAR,
    ) || incluyeRol(profile, 'ADMINISTRADOR', 'AUTORIDAD', 'OPERADOR')
  );
}

/** Solo ADMINISTRADOR puede ajustar umbrales (regla de negocio del proyecto). */
export function puedeConfigurarUmbrales(profile: PerfilConPermisos | null | undefined): boolean {
  return (
    tieneAlguno(profile, PERMISOS_RECURSOS.INVENTARIO_UMBRALES, PERMISOS_RECURSOS.UMBRAL_CONFIGURAR) ||
    incluyeRol(profile, 'ADMINISTRADOR')
  );
}

export function puedeRegistrarMovimientos(profile: PerfilConPermisos | null | undefined): boolean {
  return (
    tieneAlguno(profile, PERMISOS_RECURSOS.INVENTARIO_GESTIONAR, PERMISOS_RECURSOS.INVENTARIO_EDITAR) ||
    incluyeRol(profile, 'ADMINISTRADOR', 'AUTORIDAD', 'OPERADOR')
  );
}

export function puedeCrearCentro(profile: PerfilConPermisos | null | undefined): boolean {
  return (
    tieneAlguno(profile, PERMISOS_RECURSOS.CENTRO_CREAR, PERMISOS_RECURSOS.CENTRO_EDITAR) ||
    incluyeRol(profile, 'ADMINISTRADOR', 'AUTORIDAD')
  );
}

export function puedeEditarCentro(profile: PerfilConPermisos | null | undefined): boolean {
  return (
    tieneAlguno(profile, PERMISOS_RECURSOS.CENTRO_GESTIONAR, PERMISOS_RECURSOS.CENTRO_EDITAR) ||
    incluyeRol(profile, 'ADMINISTRADOR', 'AUTORIDAD')
  );
}

export function puedeAsignarOperadores(profile: PerfilConPermisos | null | undefined): boolean {
  return (
    tieneAlguno(profile, PERMISOS_RECURSOS.CENTRO_ASIGNAR_OPERADOR, PERMISOS_RECURSOS.CENTRO_EDITAR) ||
    incluyeRol(profile, 'ADMINISTRADOR')
  );
}

export function puedeVerSugerencias(profile: PerfilConPermisos | null | undefined): boolean {
  return tienePermiso(profile, PERMISOS_RECURSOS.INVENTARIO_SUGERENCIAS);
}

/** ¿Puede confirmar donaciones por QR? (panel operador) */
export function puedeConfirmarDonaciones(profile: PerfilConPermisos | null | undefined): boolean {
  return tienePermiso(profile, PERMISOS_CIUDADANA.DONACION_CONFIRMAR);
}

export function puedeGestionarNecesidades(profile: PerfilConPermisos | null | undefined): boolean {
  return tienePermiso(profile, PERMISOS_CIUDADANA.NECESIDAD_GESTIONAR);
}
