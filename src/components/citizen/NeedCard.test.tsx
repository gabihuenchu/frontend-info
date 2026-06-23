import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NeedCard } from './NeedCard';
import type { Necesidad } from '@/types/citizen';

function necesidad(overrides: Partial<Necesidad> = {}): Necesidad {
  return {
    id: 'n1',
    centroId: '123e4567-e89b-12d3-a456-426614174000',
    itemId: 'abcd1234-e89b-12d3-a456-426614174000',
    emergenciaId: null,
    cantidadNecesaria: 100,
    cantidadComprometida: 30,
    cantidadRestante: 70,
    prioridad: 'CRITICO',
    origen: 'MANUAL',
    estado: 'ACTIVA',
    creadaEn: '2026-03-15T12:00:00Z',
    resueltaEn: null,
    ...overrides,
  };
}

describe('NeedCard', () => {
  it('muestra el código de ítem y la etiqueta de prioridad', () => {
    render(<NeedCard need={necesidad()} />);
    expect(screen.getByRole('heading', { name: 'Ítem ABCD1234' })).toBeInTheDocument();
    expect(screen.getByText('Crítico')).toBeInTheDocument();
  });

  it('muestra cantidades necesaria, restante y comprometida', () => {
    render(<NeedCard need={necesidad()} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
    expect(screen.getByText(/30 ya comprometidas/)).toBeInTheDocument();
  });

  it('muestra la etiqueta legible del estado', () => {
    render(<NeedCard need={necesidad({ estado: 'PARCIALMENTE_CUBIERTA' })} />);
    expect(screen.getByText(/Parcialmente cubierta/)).toBeInTheDocument();
  });

  it('muestra el centro recortado a 8 caracteres en mayúsculas', () => {
    render(<NeedCard need={necesidad()} />);
    expect(screen.getByText(/123E4567…/)).toBeInTheDocument();
  });

  it('omite el bloque de comprometidas cuando es 0', () => {
    render(<NeedCard need={necesidad({ cantidadComprometida: 0 })} />);
    expect(screen.queryByText(/ya comprometidas/)).not.toBeInTheDocument();
  });
});
