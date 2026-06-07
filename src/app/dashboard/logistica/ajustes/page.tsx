'use client';

import { Settings } from 'lucide-react';

export default function AjustesLogisticaPage() {
  return (
    <div>
      <h2 className="logistics-page-title">Ajustes</h2>
      <div className="logistics-panel" style={{ padding: '1.25rem', maxWidth: 480 }}>
        <Settings size={24} style={{ color: 'var(--log-accent)', marginBottom: 12 }} />
        <p style={{ color: 'var(--log-muted)', fontSize: '0.85rem' }}>
          Configuración del módulo logística (umbrales, OSRM base URL, notificaciones). Variables de entorno en el
          backend: <code>OSRM_BASE_URL</code>, gateway <code>MS_LOGISTICS_URI</code>.
        </p>
      </div>
    </div>
  );
}
