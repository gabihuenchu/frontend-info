import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CatastrofesButton from './CatastrofesButton';

describe('CatastrofesButton', () => {
  it('renderiza el contenido (children)', () => {
    render(<CatastrofesButton>Donar ahora</CatastrofesButton>);
    expect(screen.getByRole('button', { name: 'Donar ahora' })).toBeInTheDocument();
  });

  it('aplica la clase de la variante primary por defecto', () => {
    render(<CatastrofesButton>Aceptar</CatastrofesButton>);
    const boton = screen.getByRole('button');
    expect(boton).toHaveClass('btn-primary');
    expect(boton).toHaveClass('catastrofes-button--medium');
  });

  it.each([
    ['secondary', 'btn-secondary'],
    ['danger', 'btn-danger'],
  ] as const)('aplica la clase de la variante %s', (variant, clase) => {
    render(<CatastrofesButton variant={variant}>X</CatastrofesButton>);
    expect(screen.getByRole('button')).toHaveClass(clase);
  });

  it('aplica el tamaño indicado', () => {
    render(<CatastrofesButton size="large">X</CatastrofesButton>);
    expect(screen.getByRole('button')).toHaveClass('catastrofes-button--large');
  });

  it('invoca onClick al hacer clic', async () => {
    const onClick = vi.fn();
    render(<CatastrofesButton onClick={onClick}>Click</CatastrofesButton>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('no invoca onClick cuando está deshabilitado', async () => {
    const onClick = vi.fn();
    render(
      <CatastrofesButton onClick={onClick} disabled>
        Click
      </CatastrofesButton>
    );
    const boton = screen.getByRole('button');
    expect(boton).toBeDisabled();
    await userEvent.click(boton);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('concatena className personalizado', () => {
    render(<CatastrofesButton className="mi-clase">X</CatastrofesButton>);
    expect(screen.getByRole('button')).toHaveClass('mi-clase');
  });
});
