import { PERMISOS_LOGISTICA } from '@/types/logistics';

export interface PerfilConPermisos {
  roles?: Array<string | { nombre?: string }>;
  permisos?: string[];
}

export function normalizarRoles(profile: PerfilConPermisos | null | undefined): string[] {
  return (profile?.roles ?? []).map((r) => (typeof r === 'string' ? r : r?.nombre ?? ''));
}

export function tienePermiso(profile: PerfilConPermisos | null | undefined, permiso: string): boolean {
  return (profile?.permisos ?? []).includes(permiso);
}

export function puedeVerLogistica(profile: PerfilConPermisos | null | undefined): boolean {
  const permisos = profile?.permisos ?? [];
  return Object.values(PERMISOS_LOGISTICA).some((p) => permisos.includes(p));
}

export function puedeVerResumen(profile: PerfilConPermisos | null | undefined): boolean {
  return (
    tienePermiso(profile, PERMISOS_LOGISTICA.APROBAR) ||
    tienePermiso(profile, PERMISOS_LOGISTICA.MISION)
  );
}

export function puedeVerMatchingOsrm(profile: PerfilConPermisos | null | undefined): boolean {
  return (
    tienePermiso(profile, PERMISOS_LOGISTICA.MISION) ||
    tienePermiso(profile, PERMISOS_LOGISTICA.RUTA)
  );
}

export function puedeVerSeccionAdmin(profile: PerfilConPermisos | null | undefined): boolean {
  const roles = normalizarRoles(profile);
  return roles.includes('ADMINISTRADOR') || roles.includes('AUTORIDAD');
}
