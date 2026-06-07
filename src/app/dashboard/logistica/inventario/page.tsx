'use client';

import { Package } from 'lucide-react';

export default function InventarioPage() {
  return (
    <div>
      <h2 className="logistics-page-title">Inventario</h2>
      <div className="logistics-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <Package size={40} style={{ color: 'var(--log-accent)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--log-muted)', maxWidth: 440, margin: '0 auto' }}>
          Vista de inventario por centro (ms-resources). Las transferencias validan stock vía JDBC contra la tabla
          <code style={{ margin: '0 4px' }}>inventario</code> al solicitar movimientos.
        </p>
      </div>
    </div>
  );
}
