'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useCentrosAcopio } from '@/hooks/useEmergencies';
import { useCreateDonation, useDonationQuotas } from '@/hooks/useDonations';
import { useAuth } from '@/providers/AuthProvider';
import type { Donacion } from '@/types/citizen';
import { createDonationSchema } from '@/lib/schemas/donation';
import { formatApiError } from '@/lib/api-errors';
import type { DonationCategoryId } from '@/lib/donationCategories';
import {
  DonationCategoryPicker,
  getSelectedDonationItems,
  type SelectedDonationLine,
} from './DonationCategoryPicker';

interface DonationFormProps {
  layout?: 'single' | 'steps';
  onSuccess?: (donation: Donacion) => void;
}

const STEPS = ['Centro', 'Categorías', 'Confirmar'];

export function DonationForm({ layout = 'single', onSuccess }: DonationFormProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [centroId, setCentroId] = useState<string | undefined>();
  const [activeCategory, setActiveCategory] = useState<DonationCategoryId>('alimentos-no-perecederos');
  const [selected, setSelected] = useState<Record<string, SelectedDonationLine>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [donation, setDonation] = useState<Donacion | null>(null);

  const { data: centros = [], isLoading: loadingCentros } = useCentrosAcopio();
  const { data: cupos = [], isLoading: loadingCupos } = useDonationQuotas(centroId);
  const centrosList = Array.isArray(centros) ? centros : [];
  const createDonation = useCreateDonation();

  const quotasByItem = useMemo(
    () =>
      Object.fromEntries(
        cupos.map((c) => [c.itemId, c.cantidadMaximaDonacion])
      ) as Record<string, number>,
    [cupos]
  );

  useEffect(() => {
    if (!centroId) return;
    setSelected((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const itemId of Object.keys(next)) {
        const max = quotasByItem[itemId];
        if (max == null || max <= 0) {
          delete next[itemId];
          changed = true;
        } else if (next[itemId].cantidad > max) {
          next[itemId] = { ...next[itemId], cantidad: max };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [centroId, quotasByItem]);

  const selectedItems = useMemo(() => getSelectedDonationItems(selected), [selected]);
  const selectedCentro = centrosList.find((c) => c.id === centroId);
  const isSteps = layout === 'steps';

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
      if (isSteps) {
        setStep(4);
      }
      onSuccess?.(result);
    } catch (err) {
      setSubmitError(formatApiError(err));
    }
  };

  if (authLoading) {
    return <div className="citizen-loading">Verificando sesión…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="citizen-panel">
        <h2 className="citizen-title" style={{ fontSize: '1.25rem' }}>
          Acceso restringido
        </h2>
        <p className="citizen-subtitle">
          El registro de donaciones en plataforma es solo para operadores autenticados. Los donantes
          pueden acercarse directamente a las sucursales sin cuenta.
        </p>
        <div className="citizen-actions">
          <Link href="/donaciones" className="citizen-btn citizen-btn--primary">
            Ver cómo donar (público)
          </Link>
          <Link href="/login?next=/dashboard/ciudadana/donaciones" className="citizen-btn citizen-btn--secondary">
            Acceso operadores
          </Link>
        </div>
      </div>
    );
  }

  if (donation && !isSteps) {
    return (
      <div className="citizen-panel">
        <h2 className="citizen-title" style={{ fontSize: '1.25rem' }}>
          ¡Donación registrada!
        </h2>
        <p className="citizen-subtitle">
          Acércate a {selectedCentro?.nombre ?? 'el centro de acopio'} en su horario de atención para
          entregar los recursos donados.
        </p>
        <div className="citizen-success-box">
          <p className="citizen-card-meta">
            Estado: {donation.estado} · {selectedItems.length} ítem(s) registrados
          </p>
        </div>
        <div className="citizen-actions">
          <Link href="/dashboard/ciudadana/donaciones" className="citizen-btn citizen-btn--primary">
            Volver al panel
          </Link>
          <button
            type="button"
            className="citizen-btn citizen-btn--secondary"
            onClick={() => {
              setDonation(null);
              setSelected({});
              setCentroId(undefined);
              setStep(1);
            }}
          >
            Nueva donación
          </button>
        </div>
      </div>
    );
  }

  if (donation && isSteps && step === 4) {
    return (
      <div className="citizen-wizard">
        {renderSteps(3)}
        <div className="citizen-panel">
          <h2 className="citizen-title" style={{ fontSize: '1.25rem' }}>
            ¡Donación registrada!
          </h2>
          <p className="citizen-subtitle">
            Tu aporte quedó registrado. Coordina la entrega presencial con el centro de acopio
            seleccionado.
          </p>
          <div className="citizen-success-box">
            <p className="citizen-card-meta">Estado: {donation.estado}</p>
          </div>
          <div className="citizen-actions">
            <Link href="/dashboard/ciudadana/donaciones" className="citizen-btn citizen-btn--primary">
              Volver al panel
            </Link>
          <Link href="/donaciones" className="citizen-btn citizen-btn--secondary">
            Ver portal público
          </Link>
          </div>
        </div>
      </div>
    );
  }

  const showCentro = !isSteps || step === 1;
  const showCategories = !isSteps || step === 2;
  const showConfirm = !isSteps || step === 3;

  return (
    <div className={isSteps ? 'citizen-wizard' : 'donation-form-single'}>
      {isSteps && renderSteps(step)}

      {showCentro && (
        <section className="citizen-panel donation-form-section">
          <h2 className="citizen-title" style={{ fontSize: '1.25rem' }}>
            1. Centro de acopio
          </h2>
          <p className="citizen-subtitle">Elige dónde entregarás los recursos donados.</p>
          {loadingCentros ? (
            <div className="citizen-loading">Cargando centros…</div>
          ) : centrosList.length === 0 ? (
            <div className="citizen-empty">
              No hay centros disponibles. Activa el módulo de centros o crea uno desde el dashboard de emergencias.
            </div>
          ) : (
            <div className="citizen-list" style={{ marginTop: '1.25rem' }}>
              {centrosList.map((centro) => (
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
        </section>
      )}

      {showCategories && (!isSteps || centroId) && (
        <section className="citizen-panel donation-form-section">
          <h2 className="citizen-title" style={{ fontSize: '1.25rem' }}>
            {isSteps ? '2. ' : ''}Selecciona por categoría
          </h2>
          <p className="citizen-subtitle">
            Elige ítems que el centro necesita. La cantidad máxima depende del stock pendiente de cada recurso.
          </p>
          <DonationCategoryPicker
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            selected={selected}
            onSelectedChange={setSelected}
            quotas={centroId ? quotasByItem : undefined}
            quotasLoading={Boolean(centroId) && loadingCupos}
            centroSelected={Boolean(centroId)}
          />
        </section>
      )}

      {showConfirm && (!isSteps || step === 3) && (
        <section className="citizen-panel donation-form-section">
          {!isSteps && (
            <>
              <h2 className="citizen-title" style={{ fontSize: '1.25rem' }}>
                Resumen y confirmación
              </h2>
              <p className="citizen-subtitle">
                Centro: <strong>{selectedCentro?.nombre ?? '— selecciona un centro —'}</strong>
              </p>
            </>
          )}
          {isSteps && (
            <>
              <h2 className="citizen-title" style={{ fontSize: '1.25rem' }}>
                3. Confirma tu donación
              </h2>
              <p className="citizen-subtitle">
                Centro: <strong>{selectedCentro?.nombre}</strong>
              </p>
            </>
          )}

          {selectedItems.length === 0 ? (
            <div className="citizen-empty" style={{ marginTop: '1rem' }}>
              Aún no has seleccionado ítems. Elige al menos uno en las categorías.
            </div>
          ) : (
            <ul className="citizen-list" style={{ marginTop: '1.25rem' }}>
              {Object.values(selected).map((line) => (
                <li key={line.itemId} className="citizen-list-item" style={{ cursor: 'default' }}>
                  <span>
                    <strong>{line.nombre}</strong>
                    <span className="citizen-card-meta" style={{ display: 'block' }}>
                      {line.categoriaLabel}
                    </span>
                  </span>
                  <strong>
                    {line.cantidad} {line.unidadMedida.toLowerCase()}
                  </strong>
                </li>
              ))}
            </ul>
          )}

          {submitError && (
            <div className="citizen-error" role="alert" style={{ marginTop: '1rem' }}>
              {submitError}
            </div>
          )}

          {!isSteps && (
            <div className="citizen-actions" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="citizen-btn citizen-btn--primary"
                disabled={
                  createDonation.isPending ||
                  !centroId ||
                  selectedItems.length === 0
                }
                onClick={handleSubmit}
              >
                {createDonation.isPending ? 'Registrando…' : 'Confirmar donación'}
              </button>
            </div>
          )}
        </section>
      )}

      {isSteps && step < 4 && (
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

function renderSteps(step: number) {
  return (
    <div className="citizen-steps" aria-label="Pasos del formulario">
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
  );
}
