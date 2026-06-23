import { describe, it, expect } from 'vitest';
import {
  formatItemId,
  prioridadLabel,
  prioridadClass,
  estadoNecesidadLabel,
  estadoDonacionLabel,
  estadoDonacionClass,
} from './citizenLabels';

describe('formatItemId', () => {
  it('toma los primeros 8 caracteres en mayúsculas', () => {
    expect(formatItemId('123e4567-e89b-12d3-a456-426614174000')).toBe('Ítem 123E4567');
  });

  it('funciona con ids más cortos que 8 caracteres', () => {
    expect(formatItemId('abc')).toBe('Ítem ABC');
  });
});

describe('mapas de etiquetas ciudadanas', () => {
  it('mapea todas las prioridades a su etiqueta legible', () => {
    expect(prioridadLabel).toEqual({
      CRITICO: 'Crítico',
      ALTO: 'Alto',
      MEDIO: 'Medio',
      BAJO: 'Bajo',
    });
  });

  it('asigna una clase CSS por prioridad', () => {
    expect(prioridadClass.CRITICO).toContain('citizen-badge--critico');
  });

  it('mapea los estados de necesidad', () => {
    expect(estadoNecesidadLabel.PARCIALMENTE_CUBIERTA).toBe('Parcialmente cubierta');
  });

  it('mapea los estados de donación y sus clases', () => {
    expect(estadoDonacionLabel.CONFIRMADA).toBe('Confirmada');
    expect(estadoDonacionClass.PENDIENTE).toContain('citizen-badge--pendiente');
  });
});
