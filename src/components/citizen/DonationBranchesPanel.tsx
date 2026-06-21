'use client';

import { Clock, MapPin } from 'lucide-react';
import { useCentrosAcopio } from '@/hooks/useEmergencies';

export function DonationBranchesPanel() {
  const { data: centros = [], isLoading, isError } = useCentrosAcopio();
  const list = Array.isArray(centros) ? centros : [];

  return (
    <section id="sucursales" className="citizen-panel" style={{ scrollMarginTop: '5rem' }}>
      <h2 className="citizen-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
        Sucursales de acopio
      </h2>
      <p className="citizen-subtitle" style={{ marginBottom: '1.25rem' }}>
        Puedes entregar tus donaciones presencialmente en cualquiera de estos centros activos.
      </p>

      {isLoading && <div className="citizen-loading">Cargando sucursales…</div>}

      {isError && (
        <div className="citizen-error" role="alert">
          No pudimos cargar las sucursales. Intenta más tarde o consulta la sección de
          necesidades.
        </div>
      )}

      {!isLoading && !isError && list.length === 0 && (
        <div className="citizen-empty">
          Aún no hay sucursales publicadas. Revisa más tarde o contacta a las autoridades locales.
        </div>
      )}

      {!isLoading && !isError && list.length > 0 && (
        <ul className="citizen-list" style={{ marginTop: 0 }}>
          {list.map((centro) => (
            <li key={centro.id} className="citizen-list-item" style={{ cursor: 'default' }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <strong>{centro.nombre}</strong>
                  <span
                    className={`citizen-badge${
                      centro.estado === 'Abierto'
                        ? ' citizen-badge--bajo'
                        : centro.estado === 'Cerrado'
                          ? ' citizen-badge--critico'
                          : ' citizen-badge--medio'
                    }`}
                  >
                    {centro.estado}
                  </span>
                </div>
                <p className="citizen-card-meta" style={{ marginTop: '0.35rem' }}>
                  <MapPin
                    size={14}
                    style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }}
                    aria-hidden="true"
                  />
                  {centro.direccion}, {centro.ciudad} — {centro.region}
                </p>
                {centro.horario && (
                  <p className="citizen-card-meta">
                    <Clock
                      size={14}
                      style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }}
                      aria-hidden="true"
                    />
                    Horario: {centro.horario}
                  </p>
                )}
                {centro.capacidad && (
                  <p className="citizen-card-meta">Capacidad de acopio: {centro.capacidad}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
