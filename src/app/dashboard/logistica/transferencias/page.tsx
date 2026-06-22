'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import CentroAcopioCombobox from '@/components/logistics/CentroAcopioCombobox';
import TransferenciasTable from '@/components/logistics/TransferenciasTable';
import {
  useActualizarEstadoTransferencia,
  useCentrosLogistica,
  useCrearTransferencia,
  useInventarioCentro,
  useTransferenciasVista,
} from '@/hooks/useLogistics';
import { formatApiError } from '@/lib/api-errors';
import { ETIQUETA_CATEGORIA } from '@/types/resources';
import type { EstadoTransferencia } from '@/types/logistics';

const TRANSICIONES: Record<EstadoTransferencia, EstadoTransferencia[]> = {
  SOLICITADA: ['APROBADA', 'RECHAZADA'],
  APROBADA: ['EN_TRANSITO', 'RECHAZADA'],
  EN_TRANSITO: ['RECIBIDA'],
  RECIBIDA: [],
  RECHAZADA: [],
};

export default function TransferenciasPage() {
  const { data: rows = [], isLoading, isError, error, refetch } = useTransferenciasVista();
  const {
    data: centros = [],
    isLoading: centrosCargando,
    isError: centrosError,
    error: centrosErrorDetail,
    refetch: refetchCentros,
  } = useCentrosLogistica();
  const crear = useCrearTransferencia();
  const actualizar = useActualizarEstadoTransferencia();

  const [centroOrigenId, setCentroOrigenId] = useState('');
  const [centroDestinoId, setCentroDestinoId] = useState('');
  const [notas, setNotas] = useState('');
  const [itemId, setItemId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [selectedId, setSelectedId] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState<EstadoTransferencia>('APROBADA');
  const [centroRecepcionId, setCentroRecepcionId] = useState('');

  const { data: inventario = [], isLoading: inventarioCargando } = useInventarioCentro(
    centroOrigenId || null
  );

  const lineaInventario = useMemo(
    () => inventario.find((i) => i.id === itemId) ?? null,
    [inventario, itemId]
  );

  const stockMax = lineaInventario?.stockActual ?? 1;

  useEffect(() => {
    setItemId('');
    setCantidad(1);
  }, [centroOrigenId]);

  useEffect(() => {
    if (cantidad > stockMax) setCantidad(Math.max(1, stockMax));
  }, [stockMax, cantidad]);

  const seleccionada = useMemo(
    () => rows.find((r) => r.id === selectedId) ?? null,
    [rows, selectedId]
  );

  const estadosDisponibles = useMemo(() => {
    if (!seleccionada) return ['APROBADA', 'EN_TRANSITO', 'RECIBIDA', 'RECHAZADA'] as EstadoTransferencia[];
    return TRANSICIONES[seleccionada.estado] ?? [];
  }, [seleccionada]);

  useEffect(() => {
    if (estadosDisponibles.length > 0 && !estadosDisponibles.includes(nuevoEstado)) {
      setNuevoEstado(estadosDisponibles[0]);
    }
  }, [estadosDisponibles, nuevoEstado]);

  const pendientesRecepcion = useMemo(() => {
    if (!centroRecepcionId) return [];
    return rows.filter(
      (t) =>
        t.centroDestinoId === centroRecepcionId &&
        ['SOLICITADA', 'APROBADA', 'EN_TRANSITO'].includes(t.estado)
    );
  }, [rows, centroRecepcionId]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!centroOrigenId || !centroDestinoId || !itemId) {
      toast.error('Completa centro origen, destino e insumo');
      return;
    }
    if (centroOrigenId === centroDestinoId) {
      toast.error('El centro origen y destino deben ser distintos');
      return;
    }
    if (cantidad < 1 || (lineaInventario && cantidad > lineaInventario.stockActual)) {
      toast.error('Cantidad inválida para el stock disponible');
      return;
    }
    try {
      const res = await crear.mutateAsync({
        centroOrigenId,
        centroDestinoId,
        notas: notas || undefined,
        items: [{ itemId, cantidad }],
      });
      toast.success(`Transferencia ${res.id.slice(0, 8)}… creada. El destino será notificado vía eventos.`);
      setCentroOrigenId('');
      setCentroDestinoId('');
      setNotas('');
      setItemId('');
      setCantidad(1);
    } catch (err: unknown) {
      toast.error(formatApiError(err));
    }
  };

  const handleEstado = async () => {
    if (!selectedId) {
      toast.error('Selecciona una transferencia del listado');
      return;
    }
    try {
      await actualizar.mutateAsync({ id: selectedId, data: { nuevoEstado } });
      toast.success(`Estado actualizado a ${nuevoEstado.replace(/_/g, ' ')}`);
      void refetch();
    } catch (err: unknown) {
      toast.error(formatApiError(err));
    }
  };

  const confirmarRecepcion = async (transferenciaId: string) => {
    try {
      await actualizar.mutateAsync({ id: transferenciaId, data: { nuevoEstado: 'RECIBIDA' } });
      toast.success('Recepción confirmada — el inventario del destino se actualizará vía cola de eventos');
      void refetch();
    } catch (err: unknown) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div>
      <h2 className="logistics-page-title">Transferencias</h2>
      <p className="logistics-hint logistics-hint--page">
        Solicita movimiento de insumos entre centros de acopio. Al crear o cambiar el estado se publican eventos
        RabbitMQ (<code>transfer.created</code>, <code>transfer.status.changed</code>) que notifican al equipo y
        actualizan inventario en ms-resources cuando la transferencia queda <strong>RECIBIDA</strong>.
      </p>

      <div className="logistics-grid-main" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '1.5rem' }}>
        <div className="logistics-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>Nueva solicitud</h3>
          {centrosError && (
            <p className="logistics-hint logistics-hint--error" style={{ marginBottom: '0.75rem' }}>
              No se pudieron cargar los centros de acopio: {formatApiError(centrosErrorDetail)}.{' '}
              <button type="button" className="logistics-link-btn" onClick={() => void refetchCentros()}>
                Reintentar
              </button>
            </p>
          )}
          {!centrosCargando && !centrosError && centros.length === 0 && (
            <p className="logistics-hint" style={{ marginBottom: '0.75rem' }}>
              No hay centros de acopio en el sistema. Verifica que ms-resources esté levantado y que existan registros
              en la tabla <code>centros</code>.
            </p>
          )}
          {!centrosCargando && centros.length > 0 && (
            <p className="logistics-hint" style={{ marginBottom: '0.75rem' }}>
              {centros.length} centro{centros.length === 1 ? '' : 's'} de acopio disponible
              {centros.length === 1 ? '' : 's'}. Haz clic en el campo para elegir origen y destino.
            </p>
          )}
          <form className="logistics-form logistics-form--wide" onSubmit={handleCrear}>
            <CentroAcopioCombobox
              label="Centro de acopio origen"
              centros={centros}
              value={centroOrigenId}
              onChange={setCentroOrigenId}
              loading={centrosCargando}
              error={centrosError}
              excludeId={centroDestinoId}
            />
            <CentroAcopioCombobox
              label="Centro de acopio destino"
              centros={centros}
              value={centroDestinoId}
              onChange={setCentroDestinoId}
              loading={centrosCargando}
              error={centrosError}
              excludeId={centroOrigenId}
            />

            <label>
              Insumo en inventario del origen
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                required
                disabled={!centroOrigenId || inventarioCargando}
              >
                <option value="">
                  {!centroOrigenId
                    ? 'Selecciona primero el centro origen'
                    : inventarioCargando
                      ? 'Cargando inventario…'
                      : inventario.length === 0
                        ? 'Sin líneas de inventario'
                        : 'Elegir categoría / insumo…'}
                </option>
                {inventario.map((linea) => (
                  <option key={linea.id} value={linea.id} disabled={linea.stockActual <= 0}>
                    {ETIQUETA_CATEGORIA[linea.categoria]} — stock {linea.stockActual} (
                    {linea.estadoCriticidad})
                  </option>
                ))}
              </select>
            </label>

            {lineaInventario && (
              <p className="logistics-hint">
                Disponible: <strong>{lineaInventario.stockActual}</strong> unidades · criticidad{' '}
                {lineaInventario.estadoCriticidad}
              </p>
            )}

            <label>
              Cantidad
              <input
                type="number"
                min={1}
                max={lineaInventario ? lineaInventario.stockActual : undefined}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                disabled={!itemId}
              />
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
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>Gestionar estado</h3>
          <p className="logistics-hint">
            Haz clic en una fila del listado para seleccionarla. El centro destino confirma recepción con estado{' '}
            <strong>RECIBIDA</strong> cuando el insumo llega.
          </p>
          <div className="logistics-form logistics-form--wide">
            <label>
              Transferencia seleccionada
              <input
                readOnly
                value={seleccionada ? `${seleccionada.codigo} — ${seleccionada.estado}` : 'Ninguna'}
              />
            </label>
            <label>
              Nuevo estado
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value as EstadoTransferencia)}
                disabled={!selectedId || estadosDisponibles.length === 0}
              >
                {estadosDisponibles.length === 0 ? (
                  <option value="">Sin transiciones disponibles</option>
                ) : (
                  estadosDisponibles.map((e) => (
                    <option key={e} value={e}>
                      {e.replace(/_/g, ' ')}
                    </option>
                  ))
                )}
              </select>
            </label>
            <button
              type="button"
              className="logistics-btn logistics-btn--secondary"
              onClick={handleEstado}
              disabled={actualizar.isPending || !selectedId || estadosDisponibles.length === 0}
            >
              {actualizar.isPending ? 'Actualizando…' : 'Aplicar cambio'}
            </button>
          </div>

          <hr className="logistics-divider" />

          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem' }}>Recepción en centro destino</h3>
          <CentroAcopioCombobox
            label="Centro de acopio receptor"
            centros={centros}
            value={centroRecepcionId}
            onChange={setCentroRecepcionId}
            loading={centrosCargando}
            placeholder="Filtrar transferencias entrantes…"
          />
          {centroRecepcionId && pendientesRecepcion.length === 0 && (
            <p className="logistics-hint">No hay transferencias pendientes hacia este centro.</p>
          )}
          <ul className="logistics-recepcion-list">
            {pendientesRecepcion.map((t) => (
              <li key={t.id} className="logistics-recepcion-item">
                <div>
                  <strong>{t.codigo}</strong>
                  <span className="logistics-hint">
                    {' '}
                    {t.origenNombre} → {t.destinoNombre} · {t.estado.replace(/_/g, ' ')}
                  </span>
                </div>
                {t.estado === 'EN_TRANSITO' && (
                  <button
                    type="button"
                    className="logistics-btn logistics-btn--primary logistics-btn--sm"
                    onClick={() => void confirmarRecepcion(t.id)}
                    disabled={actualizar.isPending}
                  >
                    Confirmar llegada
                  </button>
                )}
                {t.estado !== 'EN_TRANSITO' && (
                  <span className="logistics-hint">Esperando aprobación o despacho</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="logistics-panel">
        <div className="logistics-panel__head">Listado</div>
        {isError ? (
          <div className="logistics-empty" style={{ color: '#fca5a5' }}>
            {formatApiError(error)}
          </div>
        ) : (
          <TransferenciasTable
            rows={rows}
            loading={isLoading}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
          />
        )}
      </div>
    </div>
  );
}
