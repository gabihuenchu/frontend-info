import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CatastrofesCard from './CatastrofesCard';

describe('CatastrofesCard', () => {
  it('renderiza el cuerpo (children)', () => {
    render(<CatastrofesCard>Contenido</CatastrofesCard>);
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('muestra título y subtítulo cuando se proveen', () => {
    render(
      <CatastrofesCard title="Centro Maipú" subtitle="Región Metropolitana">
        body
      </CatastrofesCard>
    );
    expect(screen.getByRole('heading', { name: 'Centro Maipú' })).toBeInTheDocument();
    expect(screen.getByText('Región Metropolitana')).toBeInTheDocument();
  });

  it('no renderiza el header si no hay título ni subtítulo', () => {
    const { container } = render(<CatastrofesCard>body</CatastrofesCard>);
    expect(container.querySelector('.catastrofes-card__header')).toBeNull();
  });

  it('renderiza una imagen con alt basado en el título', () => {
    render(
      <CatastrofesCard title="Mi centro" image="/foto.png">
        body
      </CatastrofesCard>
    );
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Mi centro');
  });

  it('renderiza el footer cuando se provee', () => {
    render(<CatastrofesCard footer={<span>pie</span>}>body</CatastrofesCard>);
    expect(screen.getByText('pie')).toBeInTheDocument();
  });

  it('aplica la clase de la variante elevated', () => {
    const { container } = render(
      <CatastrofesCard variant="elevated">body</CatastrofesCard>
    );
    expect(container.querySelector('.catastrofes-card--elevated')).not.toBeNull();
  });
});
