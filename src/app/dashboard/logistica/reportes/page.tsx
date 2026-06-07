'use client';

import { FileText } from 'lucide-react';

export default function ReportesLogisticaPage() {
  return (
    <div>
      <h2 className="logistics-page-title">Reportes</h2>
      <div className="logistics-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <FileText size={40} style={{ color: 'var(--log-accent)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--log-muted)', maxWidth: 440, margin: '0 auto' }}>
          Reportes de transferencias, misiones y matching OSRM — pendiente de endpoints de listado y exportación en
          ms-logistics.
        </p>
      </div>
    </div>
  );
}
