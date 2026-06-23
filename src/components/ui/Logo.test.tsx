import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Logo from './Logo';

describe('Logo', () => {
  it('renderiza el texto de marca CATÁSTROFES y CL', () => {
    render(<Logo />);
    expect(screen.getByText('CATÁSTROFES')).toBeInTheDocument();
    expect(screen.getByText('CL')).toBeInTheDocument();
  });

  it('aplica clases de tamaño large', () => {
    const { container } = render(<Logo size="large" />);
    expect(container.querySelector('.h-16')).not.toBeNull();
  });

  it('aplica clases de la variante light', () => {
    const { container } = render(<Logo variant="light" />);
    expect(container.querySelector('.bg-white')).not.toBeNull();
  });
});
