'use client';

import LogisticsKpiCards from '@/components/logistics/LogisticsKpiCards';
import LogisticsMap from '@/components/logistics/LogisticsMap';
import LogisticsRightPanel from '@/components/logistics/LogisticsRightPanel';
import TransferenciasTable from '@/components/logistics/TransferenciasTable';
import {
  useAlertasLogistica,
  useKpisLogistica,
  useMisionDestacada,
  useTransferenciasVista,
} from '@/hooks/useLogistics';

export default function ResumenLogisticaPage() {
  const { data: kpis } = useKpisLogistica();
  const { data: alertas = [] } = useAlertasLogistica();
  const { data: mision } = useMisionDestacada();
  const { data: transferencias = [], isLoading } = useTransferenciasVista();

  if (!kpis || !mision) {
    return <div className="logistics-empty">Cargando resumen logístico…</div>;
  }

  return (
    <>
      <LogisticsKpiCards kpis={kpis} />

      <div className="logistics-grid-main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="logistics-panel">
            <div className="logistics-panel__head">Mapa Logístico en Tiempo Real</div>
            <LogisticsMap />
          </div>

          <div className="logistics-panel">
            <div className="logistics-panel__head">Transferencias en Curso</div>
            <TransferenciasTable rows={transferencias} loading={isLoading} />
          </div>
        </div>

        <LogisticsRightPanel alertas={alertas} mision={mision} />
      </div>
    </>
  );
}
