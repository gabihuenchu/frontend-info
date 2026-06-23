import { describe, it, expect } from 'vitest';
import {
  normalizarRoles,
  formatearRolesUsuario,
  tienePermiso,
  puedeVerLogistica,
  puedeVerResumen,
  puedeVerMatchingOsrm,
  puedeVerSeccionAdmin,
  puedeGestionarUsuarios,
  type PerfilConPermisos,
} from './logistics-permissions';

describe('normalizarRoles', () => {
  it('devuelve [] cuando el perfil es nulo o indefinido', () => {
    expect(normalizarRoles(null)).toEqual([]);
    expect(normalizarRoles(undefined)).toEqual([]);
  });

  it('normaliza roles como strings (recortando espacios)', () => {
    expect(normalizarRoles({ roles: [' ADMINISTRADOR ', 'OPERADOR'] })).toEqual([
      'ADMINISTRADOR',
      'OPERADOR',
    ]);
  });

  it('normaliza roles como objetos { nombre }', () => {
    expect(normalizarRoles({ roles: [{ nombre: 'AUTORIDAD' }] })).toEqual(['AUTORIDAD']);
  });

  it('descarta valores vacíos', () => {
    expect(normalizarRoles({ roles: ['', '   ', 'OPERADOR'] })).toEqual(['OPERADOR']);
  });
});

describe('formatearRolesUsuario', () => {
  it('devuelve "Sin rol" cuando no hay roles', () => {
    expect(formatearRolesUsuario({ roles: [] })).toBe('Sin rol');
  });

  it('formatea un único rol a capitalización legible', () => {
    expect(formatearRolesUsuario({ roles: ['ADMINISTRADOR'] })).toBe('Administrador');
  });

  it('reemplaza guiones bajos por espacios', () => {
    expect(formatearRolesUsuario({ roles: ['JEFE_ZONA'] })).toBe('Jefe zona');
  });

  it('une varios roles con separador', () => {
    expect(formatearRolesUsuario({ roles: ['ADMINISTRADOR', 'OPERADOR'] })).toBe(
      'Administrador · Operador'
    );
  });
});

describe('tienePermiso', () => {
  it('devuelve true cuando el permiso está presente', () => {
    expect(tienePermiso({ permisos: ['MISION_CREAR'] }, 'MISION_CREAR')).toBe(true);
  });

  it('devuelve false cuando no está presente o no hay permisos', () => {
    expect(tienePermiso({ permisos: [] }, 'MISION_CREAR')).toBe(false);
    expect(tienePermiso(null, 'MISION_CREAR')).toBe(false);
  });
});

describe('gating de logística', () => {
  const conMision: PerfilConPermisos = { permisos: ['MISION_CREAR'] };
  const conSolicitar: PerfilConPermisos = { permisos: ['TRANSFERENCIA_SOLICITAR'] };
  const sinPermisos: PerfilConPermisos = { permisos: [] };

  it('puedeVerLogistica es true con cualquier permiso de logística', () => {
    expect(puedeVerLogistica(conMision)).toBe(true);
    expect(puedeVerLogistica(conSolicitar)).toBe(true);
    expect(puedeVerLogistica(sinPermisos)).toBe(false);
  });

  it('puedeVerResumen requiere aprobar o crear misión', () => {
    expect(puedeVerResumen({ permisos: ['TRANSFERENCIA_APROBAR'] })).toBe(true);
    expect(puedeVerResumen(conMision)).toBe(true);
    expect(puedeVerResumen(conSolicitar)).toBe(false);
  });

  it('puedeVerMatchingOsrm requiere misión o ruta', () => {
    expect(puedeVerMatchingOsrm(conMision)).toBe(true);
    expect(puedeVerMatchingOsrm({ permisos: ['RUTA_OFRECER'] })).toBe(true);
    expect(puedeVerMatchingOsrm(conSolicitar)).toBe(false);
  });
});

describe('gating administrativo', () => {
  it('puedeVerSeccionAdmin acepta ADMINISTRADOR o AUTORIDAD', () => {
    expect(puedeVerSeccionAdmin({ roles: ['ADMINISTRADOR'] })).toBe(true);
    expect(puedeVerSeccionAdmin({ roles: ['AUTORIDAD'] })).toBe(true);
    expect(puedeVerSeccionAdmin({ roles: ['OPERADOR'] })).toBe(false);
  });

  it('puedeGestionarUsuarios solo acepta ADMINISTRADOR', () => {
    expect(puedeGestionarUsuarios({ roles: ['ADMINISTRADOR'] })).toBe(true);
    expect(puedeGestionarUsuarios({ roles: ['AUTORIDAD'] })).toBe(false);
  });
});
