'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Warehouse, TriangleAlert, Boxes, Activity, ArrowRight, Route } from 'lucide-react';
import { useKpisInventario, useSugerenciasRedistribucion } from '@/hooks/useResources';
import { useUserProfile } from '@/hooks/useUserProfile';
import { puedeVerSugerencias } from '@/lib/resources-permissions';
import { formatApiError } from '@/lib/api-errors';
import { ETIQUETA_CATEGORIA, type CategoriaInventario } from '@/types/resources';

export default function InventarioPage() {
  const { data: profile } = useUserProfile();
  const verSugerencias = puedeVerSugerencias(profile);
  const { data: kpis } = useKpisInventario();

  const [categoria, setCategoria] = useState<CategoriaInventario>('ALIMENTOS');
  const {
    data: sugerencias = [],
    isLoading: cargandoSug,
    isError: errorSug,
    error: errSugDetail,
  } = useSugerenciasRedistribucion(verSugerencias ? categoria : null);

  const kpiCards = [
    { icon: <Warehouse size={18} />, valor: kpis?.centrosActivos ?? '—', label: 'Centros activos' },
    { icon: <TriangleAlert size={18} />, valor: kpis?.itemsCriticosOAgotados ?? '—', label: 'Ítems críticos / agotados' },
    { icon: <Boxes size={18} />, valor: kpis?.itemsSobrestock ?? '—', label: 'Ítems en sobrestock' },
    { icon: <Activity size={18} />, valor: kpis?.movimientosUltimas24h ?? '—', label: 'Movimientos (24h)' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between" style={{ gap: 12, flexWrap: 'wrap' }}>
        <h2 className="logistics-page-title">Inventario</h2>
        <Link href="/dashboard/logistica/centros-acopio" className="logistics-btn logistics-btn--primary">
          <Warehouse size={15} /> Gestionar por centro
        </Link>
      </div>
      <p className="logistics-hint logistics-hint--page">
        Vista agregada del inventario (fuente de verdad: ms-resources). Para registrar movimientos, ajustar umbrales o
        revisar el detalle por ítem, entra a cada centro desde <strong>Centros de acopio</strong>.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: '1.5rem',
        }}
      >
        {kpiCards.map((k) => (
          <div key={k.label} className="logistics-panel" style={{ padding: '0.9rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ opacity: 0.85 }}>{k.icon}</span>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, lineHeight: 1 }}>{k.valor}</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="logistics-panel" style={{ padding: '1.25rem' }}>
        <div className="logistics-panel__head" style={{ padding: 0, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Route size={16} /> Sugerencias de redistribución
        </div>

        {!verSugerencias ? (
          <div className="logistics-empty">
            Necesitas el permiso <code>INVENTARIO_SUGERENCIAS</code> para ver las sugerencias de redistribución.
          </div>
        ) : (
          <>
            <label style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, marginBottom: '1rem', maxWidth: 280 }}>
              <span style={{ fontSize: 12, opacity: 0.8 }}>Categoría</span>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaInventario)}>
                {(Object.keys(ETIQUETA_CATEGORIA) as CategoriaInventario[]).map((c) => (
                  <option key={c} value={c}>
                    {ETIQUETA_CATEGORIA[c]}
                  </option>
                ))}
              </select>
            </label>

            {errorSug ? (
              <div className="logistics-empty" style={{ color: '#fca5a5' }}>{formatApiError(errSugDetail)}</div>
            ) : cargandoSug ? (
              <p className="logistics-hint">Calculando sugerencias…</p>
            ) : sugerencias.length === 0 ? (
              <div className="logistics-empty">
                <Package size={28} style={{ opacity: 0.6, marginBottom: 8 }} />
                <p style={{ margin: 0 }}>No hay sugerencias de redistribución para esta categoría.</p>
              </div>
            ) : (
              <table className="logistics-table">
                <thead>
                  <tr>
                    <th>Ítem</th>
                    <th>Origen (sobrestock)</th>
                    <th>Destino (déficit)</th>
                    <th>Distancia</th>
                    <th>Sugerido</th>
                  </tr>
                </thead>
                <tbody>
                  {sugerencias.map((s) => (
                    <tr key={`${s.itemCatalogoId}-${s.centroOrigenId}-${s.centroDestinoId}`}>
                      <td>{s.itemNombre}</td>
                      <td>
                        {s.centroOrigenNombre}{' '}
                        <span className="logistics-hint">({s.stockOrigen} · {s.criticidadOrigen})</span>
                      </td>
                      <td>
                        <ArrowRight size={12} style={{ verticalAlign: 'middle', opacity: 0.6 }} /> {s.centroDestinoNombre}{' '}
                        <span className="logistics-hint">({s.stockDestino} · {s.criticidadDestino})</span>
                      </td>
                      <td>{(s.distanciaMetros / 1000).toFixed(1)} km</td>
                      <td><strong>{s.cantidadSugerida}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}
