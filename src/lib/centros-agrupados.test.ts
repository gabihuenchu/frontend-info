import { describe, it, expect } from 'vitest';
import {
  agruparCentrosPorEmergencia,
  GRUPO_SIN_EMERGENCIA,
} from './centros-agrupados';
import type { CentroDetalle } from '@/types/resources';
import type { Emergencia } from '@/services/emergency.service';

function centro(id: string, emergenciaId: string | null): CentroDetalle {
  return {
    id,
    nombre: `Centro ${id}`,
    direccion: null,
    region: null,
    comuna: null,
    capacidad: null,
    horario: null,
    estado: 'ACTIVO',
    emergenciaId,
    creadoPorUsuarioId: null,
    creadoEn: '2026-01-01T00:00:00Z',
    actualizadoEn: '2026-01-01T00:00:00Z',
  };
}

function emergencia(id: string, tipo: Emergencia['tipo'], region: string): Emergencia {
  return {
    id,
    titulo: region,
    descripcion: '',
    tipo,
    severidad: 'ALTA',
    estado: 'ACTIVA',
    region,
    latitud: 0,
    longitud: 0,
  };
}

describe('agruparCentrosPorEmergencia', () => {
  it('devuelve un arreglo vacío cuando no hay centros', () => {
    expect(agruparCentrosPorEmergencia([], [])).toEqual([]);
  });

  it('agrupa centros bajo su emergencia activa', () => {
    const emergencias = [emergencia('e1', 'INCENDIO', 'Biobío')];
    const centros = [centro('c1', 'e1'), centro('c2', 'e1')];

    const grupos = agruparCentrosPorEmergencia(centros, emergencias);

    expect(grupos).toHaveLength(1);
    expect(grupos[0].key).toBe('e1');
    expect(grupos[0].centros).toHaveLength(2);
    expect(grupos[0].etiqueta).toContain('Incendio');
  });

  it('coloca el grupo sin emergencia al final', () => {
    const emergencias = [emergencia('e1', 'INCENDIO', 'Biobío')];
    const centros = [centro('c1', null), centro('c2', 'e1')];

    const grupos = agruparCentrosPorEmergencia(centros, emergencias);

    expect(grupos).toHaveLength(2);
    expect(grupos[0].key).toBe('e1');
    expect(grupos[grupos.length - 1].key).toBe(GRUPO_SIN_EMERGENCIA);
    expect(grupos[grupos.length - 1].etiqueta).toBe('Centros sin emergencia activa');
  });

  it('trata como "sin emergencia" a los centros con emergencia inactiva', () => {
    const centros = [centro('c1', 'e-inexistente')];
    const grupos = agruparCentrosPorEmergencia(centros, []);

    expect(grupos).toHaveLength(1);
    expect(grupos[0].key).toBe(GRUPO_SIN_EMERGENCIA);
  });

  it('ordena los grupos de emergencia alfabéticamente por etiqueta', () => {
    const emergencias = [
      emergencia('e1', 'TSUNAMI', 'Valparaíso'),
      emergencia('e2', 'INCENDIO', 'Araucanía'),
    ];
    const centros = [centro('c1', 'e1'), centro('c2', 'e2')];

    const grupos = agruparCentrosPorEmergencia(centros, emergencias);

    // "Incendio · Araucanía..." va antes que "Tsunami · Valparaíso..."
    expect(grupos[0].etiqueta.startsWith('Incendio')).toBe(true);
    expect(grupos[1].etiqueta.startsWith('Tsunami')).toBe(true);
  });
});
