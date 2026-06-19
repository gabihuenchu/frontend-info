'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useOfrecerRuta, useRutasVoluntario } from '@/hooks/useLogistics';
import { formatApiError } from '@/lib/api-errors';
import type { TipoVehiculo } from '@/types/logistics';

export default function RutasVoluntarioPage() {
  const { data: rutas = [], isLoading, isError, error, refetch } = useRutasVoluntario();
  const ofrecer = useOfrecerRuta();

  const [etiquetaOrigen, setEtiquetaOrigen] = useState('Santiago Centro');
  const [etiquetaDestino, setEtiquetaDestino] = useState('Valparaíso');
  const [latOrigen, setLatOrigen] = useState(-33.45);
  const [lngOrigen, setLngOrigen] = useState(-70.67);
  const [latDestino, setLatDestino] = useState(-33.04);
  const [lngDestino, setLngDestino] = useState(-71.62);
  const [tipoVehiculo, setTipoVehiculo] = useState<TipoVehiculo>('CAMIONETA');
  const [capacidadKg, setCapacidadKg] = useState(500);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ofrecer.mutateAsync({
        origen: { latitud: latOrigen, longitud: lngOrigen },
        destino: { latitud: latDestino, longitud: lngDestino },
        etiquetaOrigen,
        etiquetaDestino,
        tipoVehiculo,
        capacidadKg,
      });
      toast.success(`Ruta registrada: ${res.id.slice(0, 8)}…`);
    } catch (err: unknown) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div>
      <h2 className="logistics-page-title">Rutas de Voluntarios</h2>
      <p style={{ color: 'var(--log-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
        Ofrece tu ruta disponible para matching OSRM con misiones activas.
      </p>

      <div className="logistics-grid-main" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '1.5rem' }}>
        <div className="logistics-panel" style={{ padding: '1.25rem' }}>
          <form className="logistics-form" onSubmit={handleSubmit}>
            <label>
              Etiqueta origen
              <input value={etiquetaOrigen} onChange={(e) => setEtiquetaOrigen(e.target.value)} required />
            </label>
            <label>
              Latitud / Longitud origen
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" step="any" value={latOrigen} onChange={(e) => setLatOrigen(Number(e.target.value))} />
                <input type="number" step="any" value={lngOrigen} onChange={(e) => setLngOrigen(Number(e.target.value))} />
              </div>
            </label>
            <label>
              Etiqueta destino
              <input value={etiquetaDestino} onChange={(e) => setEtiquetaDestino(e.target.value)} required />
            </label>
            <label>
              Latitud / Longitud destino
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" step="any" value={latDestino} onChange={(e) => setLatDestino(Number(e.target.value))} />
                <input type="number" step="any" value={lngDestino} onChange={(e) => setLngDestino(Number(e.target.value))} />
              </div>
            </label>
            <label>
              Tipo vehículo
              <select value={tipoVehiculo} onChange={(e) => setTipoVehiculo(e.target.value as TipoVehiculo)}>
                <option value="AUTO">AUTO</option>
                <option value="CAMIONETA">CAMIONETA</option>
                <option value="CAMION">CAMION</option>
                <option value="FURGON">FURGON</option>
              </select>
            </label>
            <label>
              Capacidad (kg)
              <input type="number" min={1} value={capacidadKg} onChange={(e) => setCapacidadKg(Number(e.target.value))} />
            </label>
            <button type="submit" className="logistics-btn logistics-btn--primary" disabled={ofrecer.isPending}>
              {ofrecer.isPending ? 'Registrando…' : 'Registrar ruta'}
            </button>
          </form>
        </div>

        <div className="logistics-panel">
          <div className="logistics-panel__head">Rutas en la BD ({rutas.length})</div>
          {isLoading ? (
            <div className="logistics-empty">Cargando rutas…</div>
          ) : isError ? (
            <div className="logistics-empty" style={{ color: '#fca5a5' }}>
              {formatApiError(error)}
              <button type="button" className="logistics-btn logistics-btn--secondary" style={{ marginTop: 12 }} onClick={() => void refetch()}>
                Reintentar
              </button>
            </div>
          ) : rutas.length === 0 ? (
            <div className="logistics-empty">No hay rutas de voluntarios registradas.</div>
          ) : (
            <div className="logistics-matching-list" style={{ padding: '1rem' }}>
              {rutas.map((r) => (
                <div key={r.id} className="logistics-matching-item">
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--log-accent)' }}>
                      {r.etiquetaOrigen} → {r.etiquetaDestino}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--log-muted)', marginTop: 4 }}>
                      {r.tipoVehiculo} · {r.capacidadKg} kg · {r.disponible ? 'Disponible' : 'No disponible'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--log-muted)' }}>
                    {r.id.slice(0, 8)}…
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
