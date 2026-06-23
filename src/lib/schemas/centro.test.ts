import { describe, it, expect } from 'vitest';
import { crearCentroSchema, editarCentroSchema } from './centro';

const centroValido = {
  nombre: 'Centro de Acopio Maipú',
  latitud: -33.45,
  longitud: -70.66,
};

describe('crearCentroSchema', () => {
  it('acepta un centro con los campos obligatorios', () => {
    expect(crearCentroSchema.safeParse(centroValido).success).toBe(true);
  });

  it('acepta campos opcionales como cadena vacía', () => {
    const resultado = crearCentroSchema.safeParse({
      ...centroValido,
      direccion: '',
      region: '',
      comuna: '',
      horario: '',
    });
    expect(resultado.success).toBe(true);
  });

  it('rechaza un nombre vacío', () => {
    const resultado = crearCentroSchema.safeParse({ ...centroValido, nombre: '' });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe('El nombre es obligatorio');
    }
  });

  it('rechaza una capacidad no positiva', () => {
    const resultado = crearCentroSchema.safeParse({ ...centroValido, capacidad: 0 });
    expect(resultado.success).toBe(false);
  });

  it('rechaza una capacidad no entera', () => {
    const resultado = crearCentroSchema.safeParse({ ...centroValido, capacidad: 3.5 });
    expect(resultado.success).toBe(false);
  });

  it('rechaza latitud fuera de rango', () => {
    expect(crearCentroSchema.safeParse({ ...centroValido, latitud: -91 }).success).toBe(false);
    expect(crearCentroSchema.safeParse({ ...centroValido, latitud: 91 }).success).toBe(false);
  });

  it('rechaza longitud fuera de rango', () => {
    expect(crearCentroSchema.safeParse({ ...centroValido, longitud: -181 }).success).toBe(false);
    expect(crearCentroSchema.safeParse({ ...centroValido, longitud: 181 }).success).toBe(false);
  });

  it('acepta un estado válido del enum', () => {
    const resultado = crearCentroSchema.safeParse({ ...centroValido, estado: 'SATURADO' });
    expect(resultado.success).toBe(true);
  });

  it('rechaza un estado fuera del enum', () => {
    const resultado = crearCentroSchema.safeParse({ ...centroValido, estado: 'LLENO' });
    expect(resultado.success).toBe(false);
  });
});

describe('editarCentroSchema', () => {
  it('acepta un objeto vacío (todos los campos opcionales)', () => {
    expect(editarCentroSchema.safeParse({}).success).toBe(true);
  });

  it('acepta una edición parcial válida', () => {
    const resultado = editarCentroSchema.safeParse({ nombre: 'Nuevo nombre', estado: 'CERRADO' });
    expect(resultado.success).toBe(true);
  });

  it('rechaza un nombre vacío cuando se provee', () => {
    const resultado = editarCentroSchema.safeParse({ nombre: '' });
    expect(resultado.success).toBe(false);
  });
});
