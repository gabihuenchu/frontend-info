'use client';

import '@/styles/citizen.css';
import { useState } from 'react';
import { DonationForm } from '@/components/citizen/DonationForm';
import { DonacionesOperadorPanel } from '@/components/citizen/DonacionesOperadorPanel';
import { useUserProfile } from '@/hooks/useUserProfile';
import { puedeConfirmarDonaciones, puedeGestionarNecesidades } from '@/lib/resources-permissions';
import { Gift } from 'lucide-react';

type Vista = 'donante' | 'operador';

export default function PaginaDonacionesCiudadana() {
  const { data: profile } = useUserProfile();
  const mostrarOperador = puedeConfirmarDonaciones(profile) || puedeGestionarNecesidades(profile);
  const [vista, setVista] = useState<Vista>('donante');

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
          {vista === 'donante' ? 'Formulario de donaciones' : 'Panel de operador'}
        </h1>
        <p style={{ color: 'var(--color-text-secondary, #c8c0af)', maxWidth: 640, lineHeight: 1.6 }}>
          {vista === 'donante'
            ? 'Registra donaciones por categoría: alimentos, vestuario, herramientas, útiles de aseo y alojamiento y enseres. El donante recibe un código QR para confirmar la entrega en el centro.'
            : 'Confirma la recepción de donaciones por código QR y consulta las necesidades y cupos de cada centro de acopio.'}
        </p>
      </header>

      {mostrarOperador && (
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
          <button
            type="button"
            className={`citizen-btn ${vista === 'donante' ? 'citizen-btn--primary' : 'citizen-btn--secondary'}`}
            onClick={() => setVista('donante')}
          >
            Donar
          </button>
          <button
            type="button"
            className={`citizen-btn ${vista === 'operador' ? 'citizen-btn--primary' : 'citizen-btn--secondary'}`}
            onClick={() => setVista('operador')}
          >
            Operador
          </button>
        </div>
      )}

      {vista === 'donante' ? <DonationForm layout="single" /> : <DonacionesOperadorPanel />}
    </div>
  );
}
