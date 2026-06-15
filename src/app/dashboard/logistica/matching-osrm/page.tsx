'use client';

import { useState } from 'react';
import { GitBranch, Loader2 } from 'lucide-react';
import { useMatchingOsrm } from '@/hooks/useLogistics';

function formatDistancia(metros: number) {
  if (metros >= 1000) return `${(metros / 1000).toFixed(1)} km`;
  return `${Math.round(metros)} m`;
}

export default function MatchingOsrmPage() {
  const [misionId, setMisionId] = useState('');
  const [queryId, setQueryId] = useState<string | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useMatchingOsrm(queryId);

  const buscar = () => {
    if (!misionId.trim()) return;
    setQueryId(misionId.trim());
  };

  return (
    <div>
      <h2 className="logistics-page-title">Matching OSRM</h2>
      <p style={{ color: 'var(--log-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
        Servicio interno de enrutamiento: calcula candidatos voluntarios más cercanos a una misión usando OSRM
        (con fallback euclidiano si el servicio no responde).
      </p>

      <div className="logistics-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <label style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'var(--log-muted)' }}>
            UUID de la misión
            <input
              value={misionId}
              onChange={(e) => setMisionId(e.target.value)}
              placeholder="22222222-2222-2222-2222-222222222232"
              style={{
                background: '#1e2818',
                border: '1px solid var(--log-border)',
                borderRadius: 8,
                padding: '0.55rem 0.75rem',
                color: 'var(--log-text)',
              }}
            />
          </label>
          <button type="button" className="logistics-btn logistics-btn--primary" onClick={buscar} disabled={isFetching}>
            {isFetching ? <Loader2 size={16} className="animate-spin" /> : <GitBranch size={16} />}
            Ejecutar matching
          </button>
          {queryId && (
            <button type="button" className="logistics-btn logistics-btn--secondary" onClick={() => refetch()}>
              Reintentar
            </button>
          )}
        </div>
      </div>

      {isLoading && <div className="logistics-empty">Consultando OSRM…</div>}

      {error && (
        <div className="logistics-panel" style={{ padding: '1.25rem', color: '#fca5a5' }}>
          No se pudo obtener matching. Verifica que ms-logistics esté en :8085 y el gateway en :8080.
          <br />
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            {(error as Error).message}
          </span>
        </div>
      )}

      {data && (
        <div className="logistics-panel">
          <div className="logistics-panel__head">
            Candidatos para misión {data.misionId.slice(0, 8)}… ({data.candidatos.length})
          </div>
          {data.candidatos.length === 0 ? (
            <div className="logistics-empty">Sin rutas voluntario disponibles para esta misión.</div>
          ) : (
            <div className="logistics-matching-list" style={{ padding: '1rem' }}>
              {data.candidatos.map((c, i) => (
                <div key={c.rutaVoluntarioId} className="logistics-matching-item">
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      #{i + 1} — {c.etiquetaOrigen} → {c.etiquetaDestino}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--log-muted)', marginTop: 4 }}>
                      Capacidad: {c.capacidadKg} kg · Usuario {c.usuarioId.slice(0, 8)}…
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--log-accent)' }}>
                      {formatDistancia(c.distanciaMetrosOsrm)}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--log-muted)' }}>distancia OSRM</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
