import { describe, it, expect } from 'vitest';
import {
  DONATION_CATEGORIES,
  getCategoryById,
  type DonationCategoryId,
} from './donationCategories';

describe('DONATION_CATEGORIES', () => {
  it('define exactamente las 5 categorías acordadas', () => {
    expect(DONATION_CATEGORIES).toHaveLength(5);
    expect(DONATION_CATEGORIES.map((c) => c.id)).toEqual([
      'alimentos',
      'vestuario',
      'herramientas',
      'utiles-aseo',
      'alojamiento-enseres',
    ]);
  });

  it('mapea cada categoría a un enum de catálogo del backend', () => {
    expect(getCategoryById('alimentos').apiCategoria).toBe('ALIMENTOS');
    expect(getCategoryById('vestuario').apiCategoria).toBe('ROPA');
    expect(getCategoryById('utiles-aseo').apiCategoria).toBe('ARTICULOS_HIGIENE');
  });
});

describe('getCategoryById', () => {
  it('devuelve la configuración para un id válido', () => {
    const categoria = getCategoryById('herramientas');
    expect(categoria.label).toBe('Herramientas');
  });

  it('lanza un error para un id desconocido', () => {
    expect(() => getCategoryById('desconocida' as DonationCategoryId)).toThrowError(
      'Categoría desconocida: desconocida'
    );
  });
});
