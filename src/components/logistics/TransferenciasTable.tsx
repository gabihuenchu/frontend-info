'use client';

import type { TransferenciaVista } from '@/types/logistics';

function estadoBadge(estado: string) {
  const map: Record<string, string> = {
    EN_TRANSITO: 'logistics-badge--transito',
    APROBADA: 'logistics-badge--aprobada',
    RECIBIDA: 'logistics-badge--recibida',
    SOLICITADA: 'logistics-badge--solicitada',
  };
  const label = estado.replace(/_/g, ' ');
  return <span className={`logistics-badge ${map[estado] ?? 'logistics-badge--solicitada'}`}>{label}</span>;
}

function prioridadDot(p: string) {
  const cls =
    p === 'ALTA' ? 'logistics-priority__dot--alta' : p === 'MEDIA' ? 'logistics-priority__dot--media' : 'logistics-priority__dot--baja';
  return (
    <span className="logistics-priority">
      <span className={`logistics-priority__dot ${cls}`} />
      {p.charAt(0) + p.slice(1).toLowerCase()}
    </span>
  );
}

function progressBar(progreso: number, estado: string) {
  const barCls =
    estado === 'RECIBIDA' ? 'logistics-progress__bar--green' : estado === 'APROBADA' ? 'logistics-progress__bar--blue' : 'logistics-progress__bar--orange';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="logistics-progress">
        <div className={`logistics-progress__bar ${barCls}`} style={{ width: `${progreso}%` }} />
      </div>
      <span className="logistics-progress-pct">{progreso}%</span>
    </div>
  );
}

function formatFecha(iso?: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

interface TransferenciasTableProps {
  rows: TransferenciaVista[];
  loading?: boolean;
}

export default function TransferenciasTable({ rows, loading }: TransferenciasTableProps) {
  if (loading) {
    return <div className="logistics-empty">Cargando transferencias…</div>;
  }

  if (rows.length === 0) {
    return <div className="logistics-empty">No hay transferencias registradas.</div>;
  }

  return (
    <div className="logistics-table-wrap">
      <table className="logistics-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Fecha Salida</th>
            <th>Llegada Estimada</th>
            <th>Progreso</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={{ fontWeight: 600, color: 'var(--log-accent)' }}>{r.codigo}</td>
              <td>{r.origenNombre}</td>
              <td>{r.destinoNombre}</td>
              <td>{estadoBadge(r.estado)}</td>
              <td>{prioridadDot(r.prioridad)}</td>
              <td>{formatFecha(r.fechaSalida)}</td>
              <td>{formatFecha(r.llegadaEstimada)}</td>
              <td>{progressBar(r.progreso, r.estado)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
