'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useCrearMision, useMisionesVista } from '@/hooks/useLogistics';

export default function MisionesPage() {
  const { data: misiones = [], isLoading } = useMisionesVista();
  const crear = useCrearMision();

  const [centroOrigenId, setCentroOrigenId] = useState('');
  const [emergenciaId, setEmergenciaId] = useState('');
  const [tipoCarga, setTipoCarga] = useState('ALIMENTOS');
  const [pesoKg, setPesoKg] = useState(100);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await crear.mutateAsync({
        centroOrigenId,
        emergenciaId: emergenciaId || null,
        descripcionCarga: { tipo: tipoCarga, pesoKg },
        programadaEn: new Date().toISOString(),
      });
      toast.success(`Misión creada: ${res.id.slice(0, 8)}…`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg ?? 'Error al crear misión');
    }
  };

  return (
    <div>
      <h2 className="logistics-page-title">Misiones</h2>

      <div className="logistics-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem', maxWidth: 560 }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>Nueva misión</h3>
        <form className="logistics-form" onSubmit={handleCrear}>
          <label>
            Centro origen (UUID)
            <input value={centroOrigenId} onChange={(e) => setCentroOrigenId(e.target.value)} required />
          </label>
          <label>
            Emergencia (UUID, opcional)
            <input value={emergenciaId} onChange={(e) => setEmergenciaId(e.target.value)} />
          </label>
          <label>
            Tipo de carga
            <select value={tipoCarga} onChange={(e) => setTipoCarga(e.target.value)}>
              <option value="ALIMENTOS">ALIMENTOS</option>
              <option value="MEDICAMENTOS">MEDICAMENTOS</option>
              <option value="HERRAMIENTAS">HERRAMIENTAS</option>
            </select>
          </label>
          <label>
            Peso (kg)
            <input type="number" min={1} value={pesoKg} onChange={(e) => setPesoKg(Number(e.target.value))} />
          </label>
          <button type="submit" className="logistics-btn logistics-btn--primary" disabled={crear.isPending}>
            {crear.isPending ? 'Creando…' : 'Crear misión'}
          </button>
        </form>
      </div>

      <div className="logistics-panel">
        <div className="logistics-panel__head">Misiones registradas</div>
        {isLoading ? (
          <div className="logistics-empty">Cargando…</div>
        ) : (
          <div className="logistics-matching-list" style={{ padding: '1rem' }}>
            {misiones.map((m) => (
              <div key={m.id} className="logistics-matching-item">
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--log-accent)' }}>{m.codigo}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--log-muted)' }}>{m.destinoNombre}</div>
                  <span className={`logistics-badge logistics-badge--${m.estado === 'EN_CURSO' ? 'curso' : 'aprobada'}`} style={{ marginTop: 6 }}>
                    {m.estado}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="logistics-progress" style={{ width: 100 }}>
                    <div className="logistics-progress__bar logistics-progress__bar--orange" style={{ width: `${m.progreso}%` }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--log-muted)', marginTop: 4 }}>{m.progreso}%</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
