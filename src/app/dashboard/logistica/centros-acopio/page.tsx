'use client';

import Link from 'next/link';
import { Warehouse } from 'lucide-react';

export default function CentrosAcopioLogisticaPage() {
  return (
    <div>
      <h2 className="logistics-page-title">Centros de Acopio</h2>
      <div className="logistics-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <Warehouse size={40} style={{ color: 'var(--log-accent)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--log-muted)', maxWidth: 420, margin: '0 auto 1rem' }}>
          La gestión de centros se realiza en el módulo de Emergencias (ms-emergencies). Aquí verás el resumen
          logístico vinculado cuando exista el endpoint de agregación.
        </p>
        <Link href="/dashboard/emergency" className="logistics-btn logistics-btn--primary" style={{ textDecoration: 'none' }}>
          Ir a Emergencias / Centros
        </Link>
      </div>
    </div>
  );
}
