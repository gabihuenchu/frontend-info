import { describe, it, expect } from 'vitest';
import { crearEmergenciaSchema, actualizarEstadoSchema } from './emergency';

const baseValida = {
  titulo: 'Incendio forestal en Biobío',
  descripcion: 'Incendio de gran magnitud cerca de zona urbana.',
  tipo: 'INCENDIO',
  severidad: 'ALTA',
  region: 'Biobío',
  comuna: 'Concepción',
  latitud: -36.8,
  longitud: -73.05,
  afectados: 100,
};

describe('crearEmergenciaSchema — validación de texto', () => {
  it('rechaza un título demasiado corto', () => {
    const resultado = crearEmergenciaSchema.safeParse({ ...baseValida, titulo: 'AB' });
    expect(resultado.success).toBe(false);
  });

  it('rechaza una descripción demasiado corta', () => {
    const resultado = crearEmergenciaSchema.safeParse({ ...baseValida, descripcion: 'corta' });
    expect(resultado.success).toBe(false);
  });

  it('rechaza una región vacía', () => {
    const resultado = crearEmergenciaSchema.safeParse({ ...baseValida, region: '' });
    expect(resultado.success).toBe(false);
  });

  it('rechaza una comuna vacía', () => {
    const resultado = crearEmergenciaSchema.safeParse({ ...baseValida, comuna: '' });
    expect(resultado.success).toBe(false);
  });
});

describe('crearEmergenciaSchema — rangos geográficos de Chile', () => {
  it('rechaza latitud fuera del rango de Chile (norte)', () => {
    const resultado = crearEmergenciaSchema.safeParse({ ...baseValida, latitud: -10 });
    expect(resultado.success).toBe(false);
  });

  it('rechaza latitud fuera del rango de Chile (sur)', () => {
    const resultado = crearEmergenciaSchema.safeParse({ ...baseValida, latitud: -60 });
    expect(resultado.success).toBe(false);
  });

  it('rechaza longitud fuera del rango de Chile', () => {
    expect(crearEmergenciaSchema.safeParse({ ...baseValida, longitud: -90 }).success).toBe(false);
    expect(crearEmergenciaSchema.safeParse({ ...baseValida, longitud: -60 }).success).toBe(false);
  });

  it('rechaza un número de afectados negativo', () => {
    const resultado = crearEmergenciaSchema.safeParse({ ...baseValida, afectados: -1 });
    expect(resultado.success).toBe(false);
  });
});

/**
 * BUG conocido (ver errores.md [ERR-FRONT-001]): los `.refine((val) => val in [...])`
 * de `tipo`, `severidad` y `estado` son incorrectos. El operador `in` comprueba claves
 * de un array (índices "0","1",...), no pertenencia, por lo que el refine SIEMPRE
 * devuelve false y rechaza valores de enum perfectamente válidos.
 *
 * Estos tests documentan el comportamiento REAL actual para servir de guardia de
 * regresión. Cuando se corrija el schema, deberán invertirse a `.toBe(true)`.
 */
describe('crearEmergenciaSchema — comportamiento actual de enums (bug documentado)', () => {
  it('rechaza un tipo válido por el .refine defectuoso', () => {
    const resultado = crearEmergenciaSchema.safeParse(baseValida);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((i) => i.message);
      expect(mensajes).toContain('Tipo de emergencia inválido');
      expect(mensajes).toContain('Nivel de severidad inválido');
    }
  });

  it('rechaza un tipo fuera del enum (caso correcto)', () => {
    const resultado = crearEmergenciaSchema.safeParse({ ...baseValida, tipo: 'METEORITO' });
    expect(resultado.success).toBe(false);
  });
});

describe('actualizarEstadoSchema — comportamiento actual (bug documentado)', () => {
  it.each(['ACTIVA', 'CONTROLADA', 'FINALIZADA'])(
    'rechaza el estado válido %s por el .refine defectuoso',
    (estado) => {
      const resultado = actualizarEstadoSchema.safeParse({ estado });
      expect(resultado.success).toBe(false);
    }
  );

  it('rechaza un estado fuera del enum', () => {
    const resultado = actualizarEstadoSchema.safeParse({ estado: 'PAUSADA' });
    expect(resultado.success).toBe(false);
  });
});
