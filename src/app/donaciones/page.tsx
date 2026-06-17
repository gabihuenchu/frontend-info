'use client';

import Link from 'next/link';
import { CitizenShell } from '@/components/citizen/CitizenShell';
import { DonationForm } from '@/components/citizen/DonationForm';
import { PublicNeedsList } from '@/components/citizen/PublicNeedsList';

export default function DonacionesPage() {
  return (
    <CitizenShell>
      <section className="citizen-hero">
        <div className="citizen-eyebrow">
          <span className="citizen-eyebrow-dot" aria-hidden="true" />
          Participación ciudadana
        </div>
        <h1 className="citizen-title">Donaciones humanitarias</h1>
        <p className="citizen-subtitle">
          Registra tu aporte por categoría — alimentos, vestuario, herramientas, útiles de aseo
          o alojamiento y enseres — y recibe un código QR para la entrega en el centro de acopio.
        </p>
        <div className="citizen-actions">
          <a href="#formulario-donacion" className="citizen-btn citizen-btn--primary">
            Ir al formulario
          </a>
          <Link href="/donaciones/mis-contribuciones" className="citizen-btn citizen-btn--secondary">
            Mis contribuciones
          </Link>
        </div>
      </section>

      <section id="formulario-donacion" className="donation-form-section" aria-labelledby="donacion-form-title">
        <h2 id="donacion-form-title" className="citizen-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          Formulario de donación
        </h2>
        <DonationForm layout="single" />
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 className="citizen-title" style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
          Necesidades activas
        </h2>
        <p className="citizen-subtitle" style={{ marginBottom: '1.5rem' }}>
          Consulta qué recursos requieren los centros de acopio en este momento.
        </p>
        <PublicNeedsList />
      </section>
    </CitizenShell>
  );
}
