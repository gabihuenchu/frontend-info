import { describe, it, expect } from 'vitest';
import { createDonationSchema, donationItemSchema } from './donation';

const UUID_VALIDO = '123e4567-e89b-12d3-a456-426614174000';

describe('donationItemSchema', () => {
  it('acepta un ítem válido', () => {
    const resultado = donationItemSchema.safeParse({ itemId: UUID_VALIDO, cantidad: 3 });
    expect(resultado.success).toBe(true);
  });

  it('rechaza un itemId que no es UUID', () => {
    const resultado = donationItemSchema.safeParse({ itemId: 'no-uuid', cantidad: 3 });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe('Debe ser un UUID válido');
    }
  });

  it('rechaza cantidad menor a 1', () => {
    const resultado = donationItemSchema.safeParse({ itemId: UUID_VALIDO, cantidad: 0 });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe('La cantidad mínima es 1');
    }
  });

  it('rechaza cantidad no entera', () => {
    const resultado = donationItemSchema.safeParse({ itemId: UUID_VALIDO, cantidad: 2.5 });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe('La cantidad debe ser un número entero');
    }
  });
});

describe('createDonationSchema', () => {
  it('acepta una donación con al menos un ítem', () => {
    const resultado = createDonationSchema.safeParse({
      centroId: UUID_VALIDO,
      items: [{ itemId: UUID_VALIDO, cantidad: 1 }],
    });
    expect(resultado.success).toBe(true);
  });

  it('rechaza una donación sin ítems', () => {
    const resultado = createDonationSchema.safeParse({ centroId: UUID_VALIDO, items: [] });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe('Debe incluir al menos un ítem');
    }
  });

  it('rechaza un centroId inválido', () => {
    const resultado = createDonationSchema.safeParse({
      centroId: 'abc',
      items: [{ itemId: UUID_VALIDO, cantidad: 1 }],
    });
    expect(resultado.success).toBe(false);
  });
});
