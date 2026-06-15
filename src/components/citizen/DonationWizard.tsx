'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCentrosAcopio } from '@/hooks/useEmergencies';
import { useCenterNeeds } from '@/hooks/useCenterNeeds';
import { useCreateDonation } from '@/hooks/useDonations';
import { useAuth } from '@/providers/AuthProvider';
import type { Donacion, Necesidad } from '@/types/citizen';
import { formatItemId, prioridadClass, prioridadLabel } from '@/lib/citizenLabels';
import { createDonationSchema } from '@/lib/schemas/donation';

type SelectedItem = { itemId: string; cantidad: number };

const STEPS = ['Centro', 'Ítems', 'Confirmar', 'Código QR'];

export function DonationWizard() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [centroId, setCentroId] = useState<string | undefined>();
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [donation, setDonation] = useState<Donacion | null>(null);

  const { data: centros, isLoading: loadingCentros } = useCentrosAcopio();
  const { data: needs, isLoading: loadingNeeds } = useCenterNeeds(centroId);
  const createDonation = useCreateDonation();

  const activeNeeds = useMemo(
    () => (needs ?? []).filter((n) => n.estado !== 'RESUELTA'),
    [needs]
  );

  const selectedItems: SelectedItem[] = Object.entries(selected)
    .filter(([, qty]) => qty > 0)
    .map(([itemId, cantidad]) => ({ itemId, cantidad }));

  const selectedCentro = centros?.find((c) => c.id === centroId);

  const toggleItem = (need: Necesidad) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[need.itemId]) {
        delete next[need.itemId];
      } else {
        next[need.itemId] = Math.min(need.cantidadNecesaria, 1);
      }
      return next;
    });
  };

  const updateQty = (itemId: string, cantidad: number, max: number) => {
    const qty = Math.max(1, Math.min(max, cantidad));
    setSelected((prev) => ({ ...prev, [itemId]: qty }));
  };

  const canNext =
    (step === 1 && Boolean(centroId)) ||
    (step === 2 && selectedItems.length > 0) ||
    step === 3;

  const handleSubmit = async () => {
    if (!centroId) return;
    setSubmitError(null);

    const payload = { centroId, items: selectedItems };
    const parsed = createDonationSchema.safeParse(payload);
    if (!parsed.success) {
      setSubmitError(parsed.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }

    try {
      const result = await createDonation.mutateAsync(parsed.data);
      setDonation(result);
      setStep(4);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'No se pudo registrar la donación';
      setSubmitError(msg);
    }
  };

  if (authLoading) {
    return <div className="citizen-loading">Verificando sesión…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="citizen-panel">
        <h2 className="citizen-title" style={{ fontSize: '1.25rem' }}>
          Inicia sesión para donar
        </h2>
        <p className="citizen-subtitle">
          Necesitas una cuenta para registrar tu donación y recibir el código QR de entrega.
        </p>
        <div className="citizen-actions">
          <Link href="/login" className="citizen-btn citizen-btn--primary">
            Iniciar sesión
          </Link>
          <Link href="/register" className="citizen-btn citizen-btn--secondary">
            Crear cuenta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="citizen-wizard">
      <div className="citizen-steps" aria-label="Pasos del wizard">
        {STEPS.map((label, i) => {
          const num = i + 1;
          const cls =
            num === step ? 'citizen-step active' : num < step ? 'citizen-step done' : 'citizen-step';
          return (
            <div key={label} className={cls}>
              <span className="citizen-step-num">Paso {num}</span>
              {label}
            </div>
          );
        })}
      </div>

      <div className="citizen-panel">
        {step === 1 && (
          <>
            <h2 className="citizen-title" style={{ fontSize: '1.25rem' }}>
              Selecciona un centro de acopio
            </h2>
            <p className="citizen-subtitle">
              Elige dónde entregarás los recursos donados.
            </p>
            {loadingCentros ? (
              <div className="citizen-loading">Cargando centros…</div>
            ) : (
              <div className="citizen-list" style={{ marginTop: '1.25rem' }}>
                {(centros ?? []).map((centro) => (
                  <button
                    key={centro.id}
                    type="button"
                    className={`citizen-list-item${centroId === centro.id ? ' selected' : ''}`}
                    onClick={() => {
                      setCentroId(centro.id);
                      setSelected({});
                    }}
                  >
                    <div>
                      <strong>{centro.nombre}</strong>
                      <p className="citizen-card-meta">
                        {centro.direccion}, {centro.ciudad} — {centro.estado}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="citizen-title" style={{ fontSize: '1.25rem' }}>
              Elige qué donar
            </h2>
            <p className="citizen-subtitle">
              Necesidades activas en {selectedCentro?.nombre ?? 'el centro seleccionado'}.
            </p>
            {loadingNeeds ? (
              <div className="citizen-loading">Cargando necesidades del centro…</div>
            ) : activeNeeds.length === 0 ? (
              <div className="citizen-empty">
                Este centro no tiene necesidades activas. Puedes volver y elegir otro centro.
              </div>
            ) : (
              <div className="citizen-list" style={{ marginTop: '1.25rem' }}>
                {activeNeeds.map((need) => {
                  const isSelected = Boolean(selected[need.itemId]);
                  return (
                    <div
                      key={need.id}
                      className={`citizen-list-item${isSelected ? ' selected' : ''}`}
                      style={{ cursor: 'default' }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(need)}
                        style={{
                          flex: 1,
                          background: 'none',
                          border: 'none',
                          color: 'inherit',
                          textAlign: 'left',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        <strong>{formatItemId(need.itemId)}</strong>
                        <p className="citizen-card-meta">
                          Necesita {need.cantidadNecesaria} unidades
                        </p>
                      </button>
                      <span className={prioridadClass[need.prioridad]}>
                        {prioridadLabel[need.prioridad]}
                      </span>
                      {isSelected && (
                        <input
                          type="number"
                          min={1}
                          max={need.cantidadNecesaria}
                          value={selected[need.itemId]}
                          className="citizen-qty-input"
                          aria-label={`Cantidad para ${formatItemId(need.itemId)}`}
                          onChange={(e) =>
                            updateQty(
                              need.itemId,
                              Number(e.target.value),
                              need.cantidadNecesaria
                            )
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="citizen-title" style={{ fontSize: '1.25rem' }}>
              Confirma tu donación
            </h2>
            <p className="citizen-subtitle">
              Centro: <strong>{selectedCentro?.nombre}</strong>
            </p>
            <ul className="citizen-list" style={{ marginTop: '1.25rem' }}>
              {selectedItems.map((item) => (
                <li key={item.itemId} className="citizen-list-item" style={{ cursor: 'default' }}>
                  <span>{formatItemId(item.itemId)}</span>
                  <strong>{item.cantidad} uds.</strong>
                </li>
              ))}
            </ul>
            {submitError && (
              <div className="citizen-error" role="alert" style={{ marginTop: '1rem' }}>
                {submitError}
              </div>
            )}
          </>
        )}

        {step === 4 && donation && (
          <>
            <h2 className="citizen-title" style={{ fontSize: '1.25rem' }}>
              ¡Donación registrada!
            </h2>
            <p className="citizen-subtitle">
              Presenta este código en el centro de acopio para confirmar la entrega.
            </p>
            <div className="citizen-qr-box">
              <p className="citizen-card-meta">Código QR / referencia</p>
              <p className="citizen-qr-code">{donation.codigoQr}</p>
              <p className="citizen-card-meta">
                Estado: {donation.estado} · ID: {donation.id.slice(0, 8).toUpperCase()}…
              </p>
            </div>
            <div className="citizen-actions">
              <Link
                href="/donaciones/mis-contribuciones"
                className="citizen-btn citizen-btn--primary"
              >
                Ver mis contribuciones
              </Link>
              <button
                type="button"
                className="citizen-btn citizen-btn--secondary"
                onClick={() => router.push('/donaciones')}
              >
                Volver al listado
              </button>
            </div>
          </>
        )}
      </div>

      {step < 4 && (
        <div className="citizen-wizard-footer">
          <button
            type="button"
            className="citizen-btn citizen-btn--secondary"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            Atrás
          </button>

          {step < 3 ? (
            <button
              type="button"
              className="citizen-btn citizen-btn--primary"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              className="citizen-btn citizen-btn--primary"
              disabled={createDonation.isPending || selectedItems.length === 0}
              onClick={handleSubmit}
            >
              {createDonation.isPending ? 'Registrando…' : 'Confirmar donación'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
