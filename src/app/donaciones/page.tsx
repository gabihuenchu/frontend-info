'use client';

import Link from 'next/link';
import { CitizenShell } from '@/components/citizen/CitizenShell';
import { PublicNeedsList } from '@/components/citizen/PublicNeedsList';

export default function DonacionesPage() {
  return (
    <CitizenShell>
      <section className="citizen-hero">
        <div className="citizen-eyebrow">
          <span className="citizen-eyebrow-dot" aria-hidden="true" />
          Participación ciudadana
        </div>
        <h1 className="citizen-title">Necesidades humanitarias</h1>
        <p className="citizen-subtitle">
          Consulta qué recursos requieren los centros de acopio y coordina tu aporte
          para apoyar a las comunidades afectadas.
        </p>
        <div className="citizen-actions">
          <Link href="/donaciones/nueva" className="citizen-btn citizen-btn--primary">
            Quiero donar
          </Link>
          <Link href="/donaciones/mis-contribuciones" className="citizen-btn citizen-btn--secondary">
            Mis contribuciones
          </Link>
        </div>
      </section>

      <PublicNeedsList />
    </CitizenShell>
  );
}
