'use client';

import { useMemo, useState } from 'react';
import { useEmergenciasActivas } from '@/hooks/useEmergencies';
import { useCentrosDetalle } from '@/hooks/useResources';
import { useCatalogItems } from '@/hooks/useCatalogItems';
import { useCreateNeed } from '@/hooks/useNeeds';
import { createNeedSchema } from '@/lib/schemas/need';
import { formatApiError } from '@/lib/api-errors';
import { agruparCentrosPorEmergencia } from '@/lib/centros-agrupados';
import { etiquetaEmergenciaPorId } from '@/services/emergency.service';
import { prioridadLabel } from '@/lib/citizenLabels';
import type { PrioridadNecesidad } from '@/types/citizen';
import { PublicNeedsList } from './PublicNeedsList';

const PRIORIDADES: PrioridadNecesidad[] = ['CRITICO', 'ALTO', 'MEDIO', 'BAJO'];

export function NeedManagementPanel() {
  const [centroId, setCentroId] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');
  const [cantidadNecesaria, setCantidadNecesaria] = useState(10);
  const [prioridad, setPrioridad] = useState<PrioridadNecesidad>('MEDIO');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: centros = [], isLoading: loadingCentros } = useCentrosDetalle();
  const { data: emergencias = [] } = useEmergenciasActivas();
  const { data: catalogItems = [], isLoading: loadingCatalog } = useCatalogItems();
  const createNeed = useCreateNeed();

  const centrosList = (Array.isArray(centros) ? centros : []).filter((c) => c.estado !== 'CERRADO');
  const gruposCentros = useMemo(
    () => agruparCentrosPorEmergencia(centrosList, emergencias),
    [centrosList, emergencias]
  );
  const centroSeleccionado = useMemo(
    () => centrosList.find((c) => c.id === centroId) ?? null,
    [centrosList, centroId]
  );
  const etiquetaEmergenciaCentro = centroSeleccionado
    ? etiquetaEmergenciaPorId(centroSeleccionado.emergenciaId, emergencias)
    : null;
  const sortedItems = useMemo(
    () => [...catalogItems].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [catalogItems]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    const payload = {
      centroId,
      itemId,
      // Si el centro está asociado a una emergencia, la propagamos a la necesidad.
      emergenciaId: centroSeleccionado?.emergenciaId ?? undefined,
      cantidadNecesaria,
      prioridad,
    };
    const parsed = createNeedSchema.safeParse(payload);
    if (!parsed.success) {
      setSubmitError(parsed.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }

    try {
      await createNeed.mutateAsync(parsed.data);
      setSuccessMessage('Necesidad registrada correctamente.');
      setItemId('');
      setCantidadNecesaria(10);
    } catch (err) {
      setSubmitError(formatApiError(err));
    }
  };

  return (
    <div className="need-management">
      <section className="citizen-panel donation-form-section">
        <h2 className="citizen-title" style={{ fontSize: '1.25rem' }}>
          Registrar necesidad
        </h2>
        <p className="citizen-subtitle">
          Publica qué recursos requiere un centro de acopio. Los donantes solo podrán aportar ítems
          con necesidad activa y cupo disponible.
        </p>

        {!loadingCentros && centrosList.length === 0 && (
          <div className="citizen-empty" style={{ marginTop: '1rem' }}>
            No hay centros de acopio registrados. Crea uno desde el dashboard de emergencias o de centros de acopio antes
            de publicar necesidades.
          </div>
        )}
        {!loadingCatalog && sortedItems.length === 0 && (
          <div className="citizen-empty" style={{ marginTop: '1rem' }}>
            El catálogo de ítems está vacío. Agrega ítems al catálogo para poder registrar necesidades.
          </div>
        )}

        <form onSubmit={handleSubmit} className="need-form" style={{ marginTop: '1.25rem' }}>
          <label className="need-form-field">
            <span>Centro de acopio</span>
            <select
              value={centroId}
              onChange={(e) => setCentroId(e.target.value)}
              required
              disabled={loadingCentros}
            >
              <option value="">Selecciona un centro</option>
              {gruposCentros.map((grupo) => (
                <optgroup key={grupo.key} label={grupo.etiqueta}>
                  {grupo.centros.map((centro) => (
                    <option key={centro.id} value={centro.id}>
                      {centro.nombre}
                      {centro.comuna ? ` — ${centro.comuna}` : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {centroSeleccionado && (
              <span className="citizen-card-meta" style={{ marginTop: 4 }}>
                Emergencia: {etiquetaEmergenciaCentro ?? 'Sin emergencia activa'}
              </span>
            )}
          </label>

          <label className="need-form-field">
            <span>Ítem del catálogo</span>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              required
              disabled={loadingCatalog}
            >
              <option value="">Selecciona un ítem</option>
              {sortedItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre} ({item.nombreCategoria})
                </option>
              ))}
            </select>
          </label>

          <label className="need-form-field">
            <span>Cantidad necesaria</span>
            <input
              type="number"
              min={1}
              value={cantidadNecesaria}
              onChange={(e) => setCantidadNecesaria(Number(e.target.value))}
              required
            />
          </label>

          <label className="need-form-field">
            <span>Prioridad</span>
            <select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as PrioridadNecesidad)}
            >
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>
                  {prioridadLabel[p]}
                </option>
              ))}
            </select>
          </label>

          {submitError && (
            <div className="citizen-error" role="alert">
              {submitError}
            </div>
          )}
          {successMessage && (
            <div className="citizen-success" role="status">
              {successMessage}
            </div>
          )}

          <div className="citizen-actions" style={{ marginTop: '1rem' }}>
            <button
              type="submit"
              className="citizen-btn citizen-btn--primary"
              disabled={createNeed.isPending || !centroId || !itemId}
            >
              {createNeed.isPending ? 'Guardando…' : 'Publicar necesidad'}
            </button>
          </div>
        </form>
      </section>

      <section style={{ marginTop: '2.5rem' }}>
        <h2 className="citizen-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Necesidades activas
        </h2>
        <p className="citizen-subtitle" style={{ marginBottom: '1.5rem' }}>
          Listado público visible para la ciudadanía en el portal de donaciones.
        </p>
        <PublicNeedsList />
      </section>
    </div>
  );
}
