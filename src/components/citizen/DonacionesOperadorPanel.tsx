'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { QrCode, PackageCheck, ClipboardList } from 'lucide-react';
import { useConfirmDonation, useDonationQuotas } from '@/hooks/useDonations';
import { useCenterNeeds } from '@/hooks/useCenterNeeds';
import { useCentrosDetalle } from '@/hooks/useResources';
import { useEmergenciasActivas } from '@/hooks/useEmergencies';
import { useCatalogItems } from '@/hooks/useCatalogItems';
import { useUserProfile } from '@/hooks/useUserProfile';
import { puedeConfirmarDonaciones } from '@/lib/resources-permissions';
import { formatApiError } from '@/lib/api-errors';
import { agruparCentrosPorEmergencia } from '@/lib/centros-agrupados';
import { prioridadLabel } from '@/lib/citizenLabels';

export function DonacionesOperadorPanel() {
  const { data: profile } = useUserProfile();
  const puedeConfirmar = puedeConfirmarDonaciones(profile);

  const [codigoQr, setCodigoQr] = useState('');
  const [centroId, setCentroId] = useState('');

  const confirmar = useConfirmDonation();
  const { data: centros = [], isLoading: cargandoCentros } = useCentrosDetalle();
  const { data: emergencias = [] } = useEmergenciasActivas();
  const gruposCentros = useMemo(
    () => agruparCentrosPorEmergencia(centros.filter((c) => c.estado !== 'CERRADO'), emergencias),
    [centros, emergencias]
  );
  const { data: catalogItems = [] } = useCatalogItems();
  const { data: necesidades = [], isLoading: cargandoNecesidades } = useCenterNeeds(
    centroId || undefined
  );
  const { data: cupos = [] } = useDonationQuotas(centroId || undefined);

  const nombreItem = useMemo(() => {
    const map = new Map(catalogItems.map((i) => [i.id, i.nombre]));
    return (id: string) => map.get(id) ?? `Ítem ${id.slice(0, 8)}…`;
  }, [catalogItems]);

  const cupoPorItem = useMemo(
    () => new Map(cupos.map((c) => [c.itemId, c])),
    [cupos]
  );

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    const qr = codigoQr.trim();
    if (!qr) {
      toast.error('Ingresa el código QR de la donación');
      return;
    }
    try {
      const donacion = await confirmar.mutateAsync(qr);
      toast.success(
        `Donación ${donacion.codigoQr} confirmada — el stock del centro se actualizará vía eventos.`
      );
      setCodigoQr('');
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div className="need-management">
      <section className="citizen-panel donation-form-section">
        <h2 className="citizen-title" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <QrCode size={20} /> Confirmar recepción de donación
        </h2>
        <p className="citizen-subtitle">
          Escanea o ingresa el código QR que presenta el donante al llegar al centro. Al confirmar, ms-resources
          suma el stock recibido (evento <code>donation.confirmed</code>) y actualiza necesidades e inventario.
        </p>

        <form onSubmit={handleConfirmar} className="need-form" style={{ marginTop: '1.25rem' }}>
          <label className="need-form-field">
            <span>Código QR de la donación</span>
            <input
              value={codigoQr}
              onChange={(e) => setCodigoQr(e.target.value)}
              placeholder="Ej: DON-3F2A9C…"
              disabled={!puedeConfirmar}
            />
          </label>

          {!puedeConfirmar && (
            <div className="citizen-error" role="alert">
              Necesitas el permiso <code>DONACION_CONFIRMAR</code> para confirmar donaciones.
            </div>
          )}

          <div className="citizen-actions" style={{ marginTop: '1rem' }}>
            <button
              type="submit"
              className="citizen-btn citizen-btn--primary"
              disabled={!puedeConfirmar || confirmar.isPending || !codigoQr.trim()}
            >
              <PackageCheck size={16} />{' '}
              {confirmar.isPending ? 'Confirmando…' : 'Confirmar donación'}
            </button>
          </div>
        </form>
      </section>

      <section style={{ marginTop: '2.5rem' }}>
        <h2 className="citizen-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClipboardList size={20} /> Necesidades y cupos por centro
        </h2>
        <p className="citizen-subtitle" style={{ marginBottom: '1.25rem' }}>
          Consulta las necesidades activas de un centro y el cupo de donación disponible por ítem.
        </p>

        <label className="need-form-field" style={{ maxWidth: 420 }}>
          <span>Centro de acopio</span>
          <select value={centroId} onChange={(e) => setCentroId(e.target.value)} disabled={cargandoCentros}>
            <option value="">Selecciona un centro</option>
            {gruposCentros.map((grupo) => (
              <optgroup key={grupo.key} label={grupo.etiqueta}>
                {grupo.centros.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                    {c.comuna ? ` — ${c.comuna}` : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        {centroId && (
          <div style={{ marginTop: '1.25rem' }}>
            {cargandoNecesidades ? (
              <p className="citizen-subtitle">Cargando necesidades…</p>
            ) : necesidades.length === 0 ? (
              <p className="citizen-subtitle">Este centro no tiene necesidades activas.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {necesidades.map((n) => {
                  const cupo = cupoPorItem.get(n.itemId);
                  const cubierto =
                    n.cantidadNecesaria > 0
                      ? Math.min(100, Math.round((n.cantidadComprometida / n.cantidadNecesaria) * 100))
                      : 0;
                  return (
                    <div key={n.id} className="citizen-panel" style={{ padding: '0.85rem 1rem' }}>
                      <div className="flex items-center justify-between" style={{ gap: 10, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 14 }}>{nombreItem(n.itemId)}</strong>
                        <span className={`nivel-badge nivel-${prioridadBadge(n.prioridad)}`}>
                          {prioridadLabel[n.prioridad]}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 4,
                          background: 'rgba(255,255,255,0.12)',
                          margin: '0.5rem 0',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${cubierto}%`,
                            height: '100%',
                            background: 'var(--green-brand-text, #22c55e)',
                          }}
                        />
                      </div>
                      <p className="citizen-subtitle" style={{ margin: 0, fontSize: 12 }}>
                        Necesario {n.cantidadNecesaria} · comprometido {n.cantidadComprometida} · restante{' '}
                        {n.cantidadRestante}
                        {cupo ? ` · cupo donación ${cupo.cantidadMaximaDonacion}` : ''}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function prioridadBadge(prioridad: string): 'alta' | 'media' | 'baja' {
  if (prioridad === 'CRITICO' || prioridad === 'ALTO') return 'alta';
  if (prioridad === 'MEDIO') return 'media';
  return 'baja';
}
