import { describe, it, expect } from 'vitest';
import { movimientoInventarioSchema, umbralesInventarioSchema } from './inventario';

const UUID_VALIDO = '123e4567-e89b-12d3-a456-426614174000';

describe('movimientoInventarioSchema', () => {
  it('acepta un ingreso válido', () => {
    const resultado = movimientoInventarioSchema.safeParse({
      itemCatalogoId: UUID_VALIDO,
      tipoMovimiento: 'INGRESO',
      cantidad: 5,
    });
    expect(resultado.success).toBe(true);
  });

  it('acepta un egreso válido', () => {
    const resultado = movimientoInventarioSchema.safeParse({
      itemCatalogoId: UUID_VALIDO,
      tipoMovimiento: 'EGRESO',
      cantidad: 1,
    });
    expect(resultado.success).toBe(true);
  });

  it('rechaza un tipo de movimiento inválido', () => {
    const resultado = movimientoInventarioSchema.safeParse({
      itemCatalogoId: UUID_VALIDO,
      tipoMovimiento: 'AJUSTE',
      cantidad: 1,
    });
    expect(resultado.success).toBe(false);
  });

  it('rechaza cantidad menor a 1', () => {
    const resultado = movimientoInventarioSchema.safeParse({
      itemCatalogoId: UUID_VALIDO,
      tipoMovimiento: 'INGRESO',
      cantidad: 0,
    });
    expect(resultado.success).toBe(false);
  });
});

describe('umbralesInventarioSchema', () => {
  it('acepta umbrales con min <= optimo <= maximo', () => {
    const resultado = umbralesInventarioSchema.safeParse({
      itemCatalogoId: UUID_VALIDO,
      umbralMinimo: 10,
      umbralOptimo: 50,
      umbralMaximo: 100,
    });
    expect(resultado.success).toBe(true);
  });

  it('acepta umbrales iguales en el límite', () => {
    const resultado = umbralesInventarioSchema.safeParse({
      itemCatalogoId: UUID_VALIDO,
      umbralMinimo: 10,
      umbralOptimo: 10,
      umbralMaximo: 10,
    });
    expect(resultado.success).toBe(true);
  });

  it('rechaza umbral mínimo mayor que el óptimo', () => {
    const resultado = umbralesInventarioSchema.safeParse({
      itemCatalogoId: UUID_VALIDO,
      umbralMinimo: 60,
      umbralOptimo: 50,
      umbralMaximo: 100,
    });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe('El umbral mínimo no puede superar al óptimo');
      expect(resultado.error.issues[0].path).toEqual(['umbralMinimo']);
    }
  });

  it('rechaza umbral óptimo mayor que el máximo', () => {
    const resultado = umbralesInventarioSchema.safeParse({
      itemCatalogoId: UUID_VALIDO,
      umbralMinimo: 10,
      umbralOptimo: 120,
      umbralMaximo: 100,
    });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe('El umbral óptimo no puede superar al máximo');
      expect(resultado.error.issues[0].path).toEqual(['umbralOptimo']);
    }
  });

  it('rechaza umbrales negativos', () => {
    const resultado = umbralesInventarioSchema.safeParse({
      itemCatalogoId: UUID_VALIDO,
      umbralMinimo: -1,
      umbralOptimo: 50,
      umbralMaximo: 100,
    });
    expect(resultado.success).toBe(false);
  });
});
