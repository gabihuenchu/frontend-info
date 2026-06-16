import { PERMISOS_LOGISTICA } from '@/types/logistics';

export interface PerfilConPermisos {
  roles?: Array<string | { nombre?: string }>;
  permisos?: string[];
}

export function normalizarRoles(profile: PerfilConPermisos | null | undefined): string[] {
  const raw = profile?.roles ?? [];
  return raw
    .map((r) => {
      if (typeof r === 'string') return r.trim();
      if (r && typeof r === 'object') {
        const obj = r as { nombre?: string; name?: string; codigo?: string };
        return (obj.nombre ?? obj.name ?? obj.codigo ?? '').trim();
      }
      return '';
    })
    .filter(Boolean);
}

/** Texto legible para mostrar roles en UI (ej. ADMINISTRADOR → Administrador). */
export function formatearRolesUsuario(profile: PerfilConPermisos | null | undefined): string {
  const roles = normalizarRoles(profile);
  if (roles.length === 0) return 'Sin rol';
  return roles
    .map((r) => r.charAt(0) + r.slice(1).toLowerCase().replace(/_/g, ' '))
    .join(' · ');
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

/** CRUD usuarios/roles en ms-identity exige rol ADMINISTRADOR en el backend. */
export function puedeGestionarUsuarios(profile: PerfilConPermisos | null | undefined): boolean {
  return normalizarRoles(profile).includes('ADMINISTRADOR');
}
