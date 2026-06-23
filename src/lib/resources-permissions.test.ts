import { describe, it, expect } from 'vitest';
import {
  puedeGestionarCentros,
  puedeConfigurarUmbrales,
  puedeRegistrarMovimientos,
  puedeCrearCentro,
  puedeEditarCentro,
  puedeAsignarOperadores,
  puedeVerSugerencias,
  puedeConfirmarDonaciones,
  puedeGestionarNecesidades,
} from './resources-permissions';

describe('puedeGestionarCentros', () => {
  it('acepta por permiso explícito', () => {
    expect(puedeGestionarCentros({ permisos: ['CENTRO_GESTIONAR'] })).toBe(true);
  });

  it('acepta por rol (fallback)', () => {
    expect(puedeGestionarCentros({ roles: ['OPERADOR'], permisos: [] })).toBe(true);
  });

  it('acepta alias de rol en inglés (OPERATOR → OPERADOR)', () => {
    expect(puedeGestionarCentros({ roles: ['OPERATOR'], permisos: [] })).toBe(true);
  });

  it('rechaza un perfil sin permisos ni roles relevantes', () => {
    expect(puedeGestionarCentros({ roles: ['PARTICULAR'], permisos: [] })).toBe(false);
    expect(puedeGestionarCentros(null)).toBe(false);
  });
});

describe('puedeConfigurarUmbrales (solo ADMINISTRADOR)', () => {
  it('acepta por permiso de umbrales', () => {
    expect(puedeConfigurarUmbrales({ permisos: ['UMBRAL_CONFIGURAR'] })).toBe(true);
    expect(puedeConfigurarUmbrales({ permisos: ['INVENTARIO_UMBRALES'] })).toBe(true);
  });

  it('acepta al rol ADMINISTRADOR', () => {
    expect(puedeConfigurarUmbrales({ roles: ['ADMINISTRADOR'], permisos: [] })).toBe(true);
    expect(puedeConfigurarUmbrales({ roles: ['ADMIN'], permisos: [] })).toBe(true);
  });

  it('rechaza a AUTORIDAD y OPERADOR (regla de negocio)', () => {
    expect(puedeConfigurarUmbrales({ roles: ['AUTORIDAD'], permisos: [] })).toBe(false);
    expect(puedeConfigurarUmbrales({ roles: ['OPERADOR'], permisos: [] })).toBe(false);
  });
});

describe('puedeRegistrarMovimientos', () => {
  it('acepta por permiso de inventario', () => {
    expect(puedeRegistrarMovimientos({ permisos: ['INVENTARIO_GESTIONAR'] })).toBe(true);
  });

  it('acepta a roles operativos', () => {
    expect(puedeRegistrarMovimientos({ roles: ['OPERADOR'], permisos: [] })).toBe(true);
  });

  it('rechaza a un PARTICULAR sin permisos', () => {
    expect(puedeRegistrarMovimientos({ roles: ['PARTICULAR'], permisos: [] })).toBe(false);
  });
});

describe('puedeCrearCentro / puedeEditarCentro / puedeAsignarOperadores', () => {
  it('crear centro acepta ADMINISTRADOR y AUTORIDAD', () => {
    expect(puedeCrearCentro({ roles: ['ADMINISTRADOR'], permisos: [] })).toBe(true);
    expect(puedeCrearCentro({ roles: ['AUTORIDAD'], permisos: [] })).toBe(true);
    expect(puedeCrearCentro({ roles: ['OPERADOR'], permisos: [] })).toBe(false);
  });

  it('editar centro acepta por permiso CENTRO_EDITAR', () => {
    expect(puedeEditarCentro({ permisos: ['CENTRO_EDITAR'] })).toBe(true);
  });

  it('asignar operadores solo acepta ADMINISTRADOR por rol', () => {
    expect(puedeAsignarOperadores({ roles: ['ADMINISTRADOR'], permisos: [] })).toBe(true);
    expect(puedeAsignarOperadores({ roles: ['AUTORIDAD'], permisos: [] })).toBe(false);
  });
});

describe('permisos de participación ciudadana', () => {
  it('puedeVerSugerencias requiere el permiso explícito', () => {
    expect(puedeVerSugerencias({ permisos: ['INVENTARIO_SUGERENCIAS'] })).toBe(true);
    expect(puedeVerSugerencias({ permisos: [] })).toBe(false);
  });

  it('puedeConfirmarDonaciones requiere DONACION_CONFIRMAR', () => {
    expect(puedeConfirmarDonaciones({ permisos: ['DONACION_CONFIRMAR'] })).toBe(true);
    expect(puedeConfirmarDonaciones({ permisos: [] })).toBe(false);
  });

  it('puedeGestionarNecesidades requiere NECESIDAD_GESTIONAR', () => {
    expect(puedeGestionarNecesidades({ permisos: ['NECESIDAD_GESTIONAR'] })).toBe(true);
    expect(puedeGestionarNecesidades({ permisos: [] })).toBe(false);
  });
});
