'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMyContributions } from '@/hooks/useDonations';
import { useAuth } from '@/providers/AuthProvider';
import {
  estadoDonacionClass,
  estadoDonacionLabel,
  formatItemId,
} from '@/lib/citizenLabels';

export function MyContributionsPanel() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [page, setPage] = useState(0);
  const size = 10;
  const { data, isLoading, isError } = useMyContributions(page, size);

  if (authLoading) {
    return <div className="citizen-loading">Verificando sesión…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="citizen-panel">
        <h2 className="citizen-title" style={{ fontSize: '1.25rem' }}>
          Accede para ver tu impacto
        </h2>
        <p className="citizen-subtitle">
          Aquí verás el historial de donaciones que hayas registrado en la plataforma.
        </p>
        <div className="citizen-actions">
          <Link href="/login" className="citizen-btn citizen-btn--primary">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="citizen-loading">Cargando tus contribuciones…</div>;
  }

  if (isError) {
    return (
      <div className="citizen-error" role="alert">
        No pudimos cargar tu historial. Intenta nuevamente más tarde.
      </div>
    );
  }

  const donations = data?.content ?? [];

  if (donations.length === 0) {
    return (
      <div className="citizen-empty">
        <p>Aún no has registrado donaciones.</p>
        <div className="citizen-actions" style={{ justifyContent: 'center', marginTop: '1rem' }}>
          <Link href="/donaciones/nueva" className="citizen-btn citizen-btn--primary">
            Hacer mi primera donación
          </Link>
        </div>
      </div>
    );
  }

  const totalPages = data?.totalPages ?? 1;

  return (
    <>
      <div className="citizen-list">
        {donations.map((donation) => {
          const fecha = donation.donadoEn
            ? format(new Date(donation.donadoEn), "d MMM yyyy, HH:mm", { locale: es })
            : null;

          return (
            <article key={donation.id} className="citizen-card">
              <div className="citizen-card-header">
                <div>
                  <h3 className="citizen-card-title">
                    Donación {donation.id.slice(0, 8).toUpperCase()}
                  </h3>
                  {fecha && <p className="citizen-card-meta">Donado: {fecha}</p>}
                </div>
                <span className={estadoDonacionClass[donation.estado]}>
                  {estadoDonacionLabel[donation.estado]}
                </span>
              </div>

              <ul className="citizen-card-meta" style={{ listStyle: 'none', padding: 0 }}>
                {donation.items.map((item) => (
                  <li key={item.id}>
                    {formatItemId(item.itemId)} — {item.cantidad} uds.
                  </li>
                ))}
              </ul>

              <p className="citizen-card-meta" style={{ marginTop: '0.5rem' }}>
                Centro: {donation.centroId.slice(0, 8).toUpperCase()}…
              </p>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="citizen-pagination">
          <button
            type="button"
            className="citizen-btn citizen-btn--secondary"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Anterior
          </button>
          <span className="citizen-pagination-info">
            Página {page + 1} de {totalPages}
          </span>
          <button
            type="button"
            className="citizen-btn citizen-btn--secondary"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </>
  );
}
