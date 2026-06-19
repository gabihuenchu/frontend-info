'use client';

import LogisticsKpiCards from '@/components/logistics/LogisticsKpiCards';
import LogisticsMap from '@/components/logistics/LogisticsMap';
import LogisticsRightPanel from '@/components/logistics/LogisticsRightPanel';
import TransferenciasTable from '@/components/logistics/TransferenciasTable';
import { useResumenLogistica } from '@/hooks/useLogistics';
import { formatApiError } from '@/lib/api-errors';

export default function ResumenLogisticaPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useResumenLogistica();

  if (isLoading) {
    return <div className="logistics-empty">Cargando resumen logístico…</div>;
  }

  if (isError) {
    return (
      <div className="logistics-panel" style={{ padding: '1.5rem' }}>
        <p style={{ color: '#fca5a5', marginBottom: 12 }}>
          No se pudo cargar logística: {formatApiError(error)}
        </p>
        <p style={{ color: 'var(--log-muted)', fontSize: '0.85rem', marginBottom: 12 }}>
          Verifica que ms-logistics esté en :8085 y el gateway en :8080.
        </p>
        <button type="button" className="logistics-btn logistics-btn--secondary" onClick={() => void refetch()}>
          Reintentar
        </button>
      </div>
    );
  }

  const { kpis, alertas, misionDestacada, transferencias, rutas } = data!;

  return (
    <>
      <LogisticsKpiCards kpis={kpis} />

      <div className="logistics-grid-main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="logistics-panel">
            <div className="logistics-panel__head">
              Mapa Logístico en Tiempo Real
              {isFetching && (
                <span style={{ fontSize: '0.75rem', color: 'var(--log-muted)', fontWeight: 400 }}>
                  Actualizando…
                </span>
              )}
            </div>
            <LogisticsMap rutas={rutas} />
          </div>

          <div className="logistics-panel">
            <div className="logistics-panel__head">Transferencias en Curso</div>
            <TransferenciasTable rows={transferencias} />
          </div>
        </div>

        <LogisticsRightPanel alertas={alertas} mision={misionDestacada} />
      </div>
    </>
  );
}
