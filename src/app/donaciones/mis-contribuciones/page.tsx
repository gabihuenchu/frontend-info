'use client';

import Link from 'next/link';
import { CitizenShell } from '@/components/citizen/CitizenShell';
import { MyContributionsPanel } from '@/components/citizen/MyContributionsPanel';

export default function MisContribucionesPage() {
  return (
    <CitizenShell>
      <section className="citizen-hero">
        <div className="citizen-eyebrow">
          <span className="citizen-eyebrow-dot" aria-hidden="true" />
          Tu impacto
        </div>
        <h1 className="citizen-title">Mis contribuciones</h1>
        <p className="citizen-subtitle">
          Revisa el estado de tus donaciones registradas y los códigos de entrega asociados.
        </p>
        <div className="citizen-actions">
          <Link href="/donaciones/nueva" className="citizen-btn citizen-btn--primary">
            Nueva donación
          </Link>
        </div>
      </section>

      <MyContributionsPanel />
    </CitizenShell>
  );
}
