'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import TransferenciasTable from '@/components/logistics/TransferenciasTable';
import {
  useActualizarEstadoTransferencia,
  useCrearTransferencia,
  useTransferenciasVista,
} from '@/hooks/useLogistics';
import { formatApiError } from '@/lib/api-errors';
import type { EstadoTransferencia } from '@/types/logistics';

export default function TransferenciasPage() {
  const { data: rows = [], isLoading, isError, error } = useTransferenciasVista();
  const crear = useCrearTransferencia();
  const actualizar = useActualizarEstadoTransferencia();

  const [centroOrigenId, setCentroOrigenId] = useState('');
  const [centroDestinoId, setCentroDestinoId] = useState('');
  const [notas, setNotas] = useState('');
  const [itemId, setItemId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [selectedId, setSelectedId] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState<EstadoTransferencia>('APROBADA');

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await crear.mutateAsync({
        centroOrigenId,
        centroDestinoId,
        notas: notas || undefined,
        items: [{ itemId, cantidad }],
      });
      toast.success(`Transferencia creada: ${res.id.slice(0, 8)}…`);
      setCentroOrigenId('');
      setCentroDestinoId('');
      setNotas('');
    } catch (err: unknown) {
      toast.error(formatApiError(err));
    }
  };

  const handleEstado = async () => {
    if (!selectedId) {
      toast.error('Ingresa el UUID de la transferencia');
      return;
    }
    try {
      await actualizar.mutateAsync({ id: selectedId, data: { nuevoEstado } });
      toast.success(`Estado actualizado a ${nuevoEstado}`);
    } catch (err: unknown) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div>
      <h2 className="logistics-page-title">Transferencias</h2>

      <div className="logistics-grid-main" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '1.5rem' }}>
        <div className="logistics-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>Nueva solicitud</h3>
          <form className="logistics-form" onSubmit={handleCrear}>
            <label>
              Centro origen (UUID)
              <input value={centroOrigenId} onChange={(e) => setCentroOrigenId(e.target.value)} required />
            </label>
            <label>
              Centro destino (UUID)
              <input value={centroDestinoId} onChange={(e) => setCentroDestinoId(e.target.value)} required />
            </label>
            <label>
              Item inventario (UUID)
              <input value={itemId} onChange={(e) => setItemId(e.target.value)} required />
            </label>
            <label>
              Cantidad
              <input type="number" min={1} value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} />
            </label>
            <label>
              Notas
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} />
            </label>
            <button type="submit" className="logistics-btn logistics-btn--primary" disabled={crear.isPending}>
              {crear.isPending ? 'Enviando…' : 'Solicitar transferencia'}
            </button>
          </form>
        </div>

        <div className="logistics-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>Actualizar estado (aprobar)</h3>
          <div className="logistics-form">
            <label>
              ID transferencia
              <input value={selectedId} onChange={(e) => setSelectedId(e.target.value)} placeholder="UUID" />
            </label>
            <label>
              Nuevo estado
              <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value as EstadoTransferencia)}>
                <option value="APROBADA">APROBADA</option>
                <option value="EN_TRANSITO">EN_TRANSITO</option>
                <option value="RECIBIDA">RECIBIDA</option>
                <option value="RECHAZADA">RECHAZADA</option>
              </select>
            </label>
            <button type="button" className="logistics-btn logistics-btn--secondary" onClick={handleEstado} disabled={actualizar.isPending}>
              {actualizar.isPending ? 'Actualizando…' : 'Aplicar cambio'}
            </button>
          </div>
        </div>
      </div>

      <div className="logistics-panel">
        <div className="logistics-panel__head">Listado</div>
        {isError ? (
          <div className="logistics-empty" style={{ color: '#fca5a5' }}>{formatApiError(error)}</div>
        ) : (
          <TransferenciasTable rows={rows} loading={isLoading} />
        )}
      </div>
    </div>
  );
}
