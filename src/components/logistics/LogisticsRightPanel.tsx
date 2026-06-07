'use client';

import Link from 'next/link';
import { AlertTriangle, Info, CheckCircle, AlertCircle, Plus, Target, Warehouse, Route } from 'lucide-react';
import type { AlertaLogistica, MisionVista } from '@/types/logistics';

const alertIcon: Record<string, React.ReactNode> = {
  danger: <AlertCircle size={18} color="#ef4444" />,
  warning: <AlertTriangle size={18} color="#f97316" />,
  info: <Info size={18} color="#60a5fa" />,
  success: <CheckCircle size={18} color="#22c55e" />,
};

interface LogisticsRightPanelProps {
  alertas: AlertaLogistica[];
  mision: MisionVista;
}

export default function LogisticsRightPanel({ alertas, mision }: LogisticsRightPanelProps) {
  return (
    <div className="logistics-right-col">
      <div className="logistics-panel">
        <div className="logistics-panel__head">Alertas Logísticas</div>
        <div>
          {alertas.map((a) => (
            <div key={a.id} className="logistics-alert">
              {alertIcon[a.tipo]}
              <div>
                <p className="logistics-alert__title">{a.titulo}</p>
                <p className="logistics-alert__desc">{a.descripcion}</p>
                <div className="logistics-alert__time">{a.hace}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="logistics-panel">
        <div className="logistics-panel__head">Misión Destacada</div>
        <div className="logistics-mision-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Misión {mision.codigo}</span>
            <span className="logistics-badge logistics-badge--curso">EN CURSO</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--log-muted)', margin: '0.5rem 0' }}>
            {mision.destinoNombre}
          </p>
          <div className="logistics-priority" style={{ marginBottom: 8 }}>
            <span className="logistics-priority__dot logistics-priority__dot--alta" />
            Prioridad Alta
          </div>
          <div className="logistics-mision-card__progress">
            <div className="logistics-mision-card__progress-bar" style={{ width: `${mision.progreso}%` }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--log-muted)' }}>{mision.progreso}% completado</div>
          {mision.voluntarioNombre && (
            <div style={{ marginTop: 12, fontSize: '0.8rem' }}>
              <strong>Voluntario:</strong> {mision.voluntarioNombre}
            </div>
          )}
          <Link
            href={`/dashboard/logistica/misiones`}
            className="logistics-btn logistics-btn--primary"
            style={{ marginTop: 12, display: 'inline-flex', textDecoration: 'none' }}
          >
            Ver misión
          </Link>
        </div>
      </div>

      <div className="logistics-panel">
        <div className="logistics-panel__head">Acciones Rápidas</div>
        <div className="logistics-quick-grid">
          <Link href="/dashboard/logistica/transferencias" className="logistics-quick-btn">
            <Plus size={18} />
            Nueva Transferencia
          </Link>
          <Link href="/dashboard/logistica/misiones" className="logistics-quick-btn">
            <Target size={18} />
            Nueva Misión
          </Link>
          <Link href="/dashboard/logistica/centros-acopio" className="logistics-quick-btn">
            <Warehouse size={18} />
            Nuevo Centro
          </Link>
          <Link href="/dashboard/logistica/rutas-voluntario" className="logistics-quick-btn">
            <Route size={18} />
            Registrar Ruta
          </Link>
        </div>
      </div>
    </div>
  );
}
