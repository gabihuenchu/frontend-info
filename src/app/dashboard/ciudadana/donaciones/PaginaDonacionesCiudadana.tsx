'use client';

import '@/styles/citizen.css';
import { DonationForm } from '@/components/citizen/DonationForm';
import { Gift } from 'lucide-react';

export default function PaginaDonacionesCiudadana() {
  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '1.5rem 2rem 2.5rem',
        background: 'var(--dark-bg-main, #0d0f07)',
      }}
    >
      <header style={{ marginBottom: '1.75rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted, #8a7f72)',
            marginBottom: '0.5rem',
          }}
        >
          <Gift size={14} />
          Participación ciudadana
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display, Outfit, sans-serif)',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800,
            color: 'var(--color-text-primary, #f5f0e8)',
            marginBottom: '0.5rem',
          }}
        >
          Gestión de donaciones (operadores)
        </h1>
        <p style={{ color: 'var(--color-text-secondary, #c8c0af)', maxWidth: 640, lineHeight: 1.6 }}>
          Registra en el sistema las donaciones recibidas presencialmente en los centros de acopio.
          El portal público no requiere que los donantes tengan cuenta.
        </p>
      </header>

      <DonationForm layout="single" />
    </div>
  );
}
