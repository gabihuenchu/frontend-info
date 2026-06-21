'use client';

import Link from 'next/link';
import { CitizenShell } from '@/components/citizen/CitizenShell';
import { CitizenOperatorAccessNote } from '@/components/citizen/CitizenOperatorAccessNote';
import { DonationBranchesPanel } from '@/components/citizen/DonationBranchesPanel';
import { DonationStepsGuide } from '@/components/citizen/DonationStepsGuide';
import { PublicNeedsList } from '@/components/citizen/PublicNeedsList';
import { DONATION_CATEGORIES } from '@/lib/donationCategories';

export default function DonacionesPage() {
  return (
    <CitizenShell>
      <section className="citizen-hero">
        <div className="citizen-eyebrow">
          <span className="citizen-eyebrow-dot" aria-hidden="true" />
          Apoyo ciudadano
        </div>
        <h1 className="citizen-title">Donaciones humanitarias</h1>
        <p className="citizen-subtitle">
          Si quieres ayudar con insumos físicos, acércate a una de nuestras sucursales con lo que
          desees donar. No necesitas cuenta, registro previo ni cita: solo revisa qué se necesita y
          entrega en el centro de acopio.
        </p>
        <div className="citizen-actions">
          <Link href="#como-donar" className="citizen-btn citizen-btn--primary">
            Ver cómo donar
          </Link>
          <Link href="#sucursales" className="citizen-btn citizen-btn--secondary">
            Ver sucursales
          </Link>
        </div>
      </section>

      <DonationStepsGuide />

      <section className="citizen-panel" style={{ marginBottom: '2rem' }}>
        <h2 className="citizen-title" style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
          Insumos que aceptamos
        </h2>
        <p className="citizen-subtitle" style={{ marginBottom: '1.25rem' }}>
          Puedes donar cualquiera de estos tipos de recursos, según lo que tengas disponible y lo
          que indiquen las necesidades activas.
        </p>
        <ul className="citizen-list" style={{ marginTop: 0 }}>
          {DONATION_CATEGORIES.map((cat) => (
            <li key={cat.id} className="citizen-list-item" style={{ cursor: 'default' }}>
              <div>
                <strong>{cat.label}</strong>
                <p className="citizen-card-meta">{cat.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <DonationBranchesPanel />

      <section id="necesidades" style={{ marginTop: '2.5rem', scrollMarginTop: '5rem' }}>
        <h2 className="citizen-title" style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
          Necesidades activas
        </h2>
        <p className="citizen-subtitle" style={{ marginBottom: '1.5rem' }}>
          Recursos que los centros de acopio están solicitando en este momento. Te ayudan a elegir
          qué llevar en tu próxima visita.
        </p>
        <PublicNeedsList />
      </section>

      <CitizenOperatorAccessNote />
    </CitizenShell>
  );
}
