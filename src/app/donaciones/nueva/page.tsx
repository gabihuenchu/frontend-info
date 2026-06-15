'use client';

import { CitizenShell } from '@/components/citizen/CitizenShell';
import { DonationWizard } from '@/components/citizen/DonationWizard';

export default function NuevaDonacionPage() {
  return (
    <CitizenShell>
      <section className="citizen-hero">
        <div className="citizen-eyebrow">
          <span className="citizen-eyebrow-dot" aria-hidden="true" />
          Wizard de donación
        </div>
        <h1 className="citizen-title">Registrar una donación</h1>
        <p className="citizen-subtitle">
          Selecciona un centro, elige los ítems y recibe tu código QR para la entrega presencial.
        </p>
      </section>

      <DonationWizard />
    </CitizenShell>
  );
}
