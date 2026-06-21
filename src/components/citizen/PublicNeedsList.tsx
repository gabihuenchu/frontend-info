'use client';

import { useState } from 'react';
import { usePublicNeeds } from '@/hooks/usePublicNeeds';
import { NeedCard } from './NeedCard';

export function PublicNeedsList() {
  const [page, setPage] = useState(0);
  const size = 12;
  const { data, isLoading, isError, error } = usePublicNeeds(page, size);

  if (isLoading) {
    return <div className="citizen-loading">Cargando necesidades públicas…</div>;
  }

  if (isError) {
    return (
      <div className="citizen-error" role="alert">
        No pudimos cargar las necesidades. Verifica que el gateway (8080), ms-citizen y tu
        PostgreSQL local estén activos (`docker compose up -d redis rabbitmq` y backends con perfil
        `backends`).
        {error instanceof Error && `: ${error.message}`}
      </div>
    );
  }

  const needs = data?.content ?? [];

  if (needs.length === 0) {
    return (
      <div className="citizen-empty">
        No hay necesidades publicadas en este momento. Vuelve más tarde o consulta un centro de acopio.
      </div>
    );
  }

  const totalPages = data?.totalPages ?? 1;

  return (
    <>
      <div className="citizen-grid" role="list">
        {needs.map((need) => (
          <div key={need.id} role="listitem">
            <NeedCard need={need} />
          </div>
        ))}
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
