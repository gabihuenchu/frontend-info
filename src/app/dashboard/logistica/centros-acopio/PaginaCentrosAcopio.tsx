'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Warehouse,
  Plus,
  MapPin,
  Boxes,
  TriangleAlert,
  Activity,
  ArrowLeftRight,
  Settings2,
  Trash2,
} from 'lucide-react';
import { useCentrosDetalle, useKpisInventario, useEliminarCentro } from '@/hooks/useResources';
import { useEmergenciasActivas } from '@/hooks/useEmergencies';
import { useUserProfile } from '@/hooks/useUserProfile';
import { puedeCrearCentro, puedeEditarCentro } from '@/lib/resources-permissions';
import { formatApiError } from '@/lib/api-errors';
import { agruparCentrosPorEmergencia } from '@/lib/centros-agrupados';
import { etiquetaEmergenciaPorId, type Emergencia } from '@/services/emergency.service';
import CentrosMapa from '@/components/centros/CentrosMapa';
import CentroDetalleEditor from '@/components/centros/CentroDetalleEditor';
import CentroInventarioPanel from '@/components/centros/CentroInventarioPanel';
import CrearCentroDialog from '@/components/centros/CrearCentroDialog';
import {
  ETIQUETA_ESTADO_CENTRO,
  type CentroDetalle,
  type EstadoCentro,
} from '@/types/resources';

const ESTADO_PILL: Record<EstadoCentro, string> = {
  ACTIVO: 'estado-pill estado-abierto',
  SATURADO: 'estado-pill estado-evaluacion',
  INACTIVO: 'estado-pill estado-evaluacion',
  CERRADO: 'estado-pill estado-cerrado',
};

type DetalleTab = 'detalle' | 'inventario';

export default function PaginaCentrosAcopio() {
  const router = useRouter();
  const { data: profile } = useUserProfile();
  const { data: centros = [], isLoading, isError, error, refetch } = useCentrosDetalle();
  const {
    data: kpis,
    isLoading: kpisLoading,
    isError: kpisError,
    error: kpisErrorDetail,
    refetch: refetchKpis,
  } = useKpisInventario();
  const { data: emergencias = [] } = useEmergenciasActivas();

  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | EstadoCentro>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detalleTab, setDetalleTab] = useState<DetalleTab>('detalle');
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [gruposColapsados, setGruposColapsados] = useState<Set<string>>(new Set());

  const centrosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return centros.filter((c) => {
      // Los centros CERRADOS (borrado lógico) se ocultan salvo que se filtre explícitamente por ese estado.
      if (filtroEstado === 'TODOS' && c.estado === 'CERRADO') return false;
      const estadoOk = filtroEstado === 'TODOS' || c.estado === filtroEstado;
      const textoOk =
        !q ||
        c.nombre.toLowerCase().includes(q) ||
        (c.comuna ?? '').toLowerCase().includes(q) ||
        (c.region ?? '').toLowerCase().includes(q);
      return estadoOk && textoOk;
    });
  }, [centros, filtroEstado, busqueda]);

  const gruposCentros = useMemo(
    () => agruparCentrosPorEmergencia(centrosFiltrados, emergencias),
    [centrosFiltrados, emergencias]
  );

  const toggleGrupo = (key: string) =>
    setGruposColapsados((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const seleccionado = useMemo(
    () => centros.find((c) => c.id === selectedId) ?? null,
    [centros, selectedId]
  );

  const valorKpi = (valor: number | undefined) => {
    if (kpisLoading) return '…';
    if (kpisError) return '—';
    return valor ?? 0;
  };

  const kpiCards = [
    { icon: <Warehouse size={18} />, valor: valorKpi(kpis?.centrosActivos), label: 'Centros activos' },
    { icon: <TriangleAlert size={18} />, valor: valorKpi(kpis?.itemsCriticosOAgotados), label: 'Ítems críticos / agotados' },
    { icon: <Boxes size={18} />, valor: valorKpi(kpis?.itemsSobrestock), label: 'Ítems en sobrestock' },
    { icon: <Activity size={18} />, valor: valorKpi(kpis?.movimientosUltimas24h), label: 'Movimientos (24h)' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between" style={{ gap: 12, flexWrap: 'wrap' }}>
        <h2 className="logistics-page-title">Centros de Acopio</h2>
        {puedeCrearCentro(profile) && (
          <button
            type="button"
            className="logistics-btn logistics-btn--primary"
            onClick={() => setMostrarCrear(true)}
          >
            <Plus size={15} /> Crear centro
          </button>
        )}
      </div>
      <p className="logistics-hint logistics-hint--page">
        Gestiona los centros de acopio activos, su inventario por ítem, umbrales de criticidad y operadores. El
        inventario es la fuente de verdad de ms-resources; los movimientos recalculan la criticidad y disparan las
        necesidades ciudadanas.
      </p>

      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: '1.25rem',
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

      {kpisError && (
        <div className="logistics-empty" style={{ color: '#fca5a5', marginBottom: '1rem' }}>
          No se pudieron cargar los indicadores: {formatApiError(kpisErrorDetail)}{' '}
          <button type="button" className="logistics-link-btn" onClick={() => void refetchKpis()}>
            Reintentar
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="logistics-panel" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Buscar por nombre, comuna o región…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: '1 1 220px' }}
        />
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as 'TODOS' | EstadoCentro)}>
          <option value="TODOS">Todos los estados</option>
          {(Object.keys(ETIQUETA_ESTADO_CENTRO) as EstadoCentro[]).map((es) => (
            <option key={es} value={es}>
              {ETIQUETA_ESTADO_CENTRO[es]}
            </option>
          ))}
        </select>
      </div>

      {isError && (
        <div className="logistics-empty" style={{ color: '#fca5a5' }}>
          {formatApiError(error)}{' '}
          <button type="button" className="logistics-link-btn" onClick={() => void refetch()}>
            Reintentar
          </button>
        </div>
      )}

      {/* Lista + mapa */}
      <div className="logistics-grid-main" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="logistics-panel" style={{ padding: '1rem' }}>
          <div className="logistics-panel__head" style={{ padding: 0, marginBottom: '0.75rem' }}>
            {isLoading ? 'Cargando centros…' : `${centrosFiltrados.length} centro(s)`}
          </div>
          {!isLoading && centrosFiltrados.length === 0 ? (
            <div className="logistics-empty">No hay centros con los filtros seleccionados.</div>
          ) : (
            <div className="centros-grupos" style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 460, overflowY: 'auto' }}>
              {gruposCentros.map((grupo) => {
                const colapsado = gruposColapsados.has(grupo.key);
                return (
                  <div key={grupo.key} className="centros-grupo">
                    <button
                      type="button"
                      className="centros-grupo__head"
                      onClick={() => toggleGrupo(grupo.key)}
                    >
                      <span>{grupo.etiqueta}</span>
                      <span className="logistics-hint">
                        {grupo.centros.length} centro(s) {colapsado ? '▸' : '▾'}
                      </span>
                    </button>
                    {!colapsado && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
                        {grupo.centros.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="centro-grid-card"
                            style={{
                              textAlign: 'left',
                              cursor: 'pointer',
                              outline: c.id === selectedId ? '2px solid var(--green-brand-text, #22c55e)' : 'none',
                            }}
                            onClick={() => {
                              setSelectedId(c.id);
                              setDetalleTab('detalle');
                            }}
                          >
                            <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <MapPin size={13} /> {c.nombre}
                              </span>
                              <span className={ESTADO_PILL[c.estado] ?? 'estado-pill'}>
                                {ETIQUETA_ESTADO_CENTRO[c.estado]}
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: 11, opacity: 0.75 }}>
                              {[c.comuna, c.region].filter(Boolean).join(', ') || 'Sin ubicación administrativa'}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="logistics-panel" style={{ padding: 0, minHeight: 320, overflow: 'hidden' }}>
          <CentrosMapa centros={centrosFiltrados} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>

      {/* Detalle del centro seleccionado */}
      {seleccionado && (
        <div style={{ marginTop: '1.5rem' }}>
          <DetalleCentro
            centro={seleccionado}
            profile={profile}
            emergencias={emergencias}
            tab={detalleTab}
            setTab={setDetalleTab}
            onActualizado={() => void refetch()}
            onEliminado={() => {
              setSelectedId(null);
              void refetch();
            }}
            onNuevaTransferencia={() =>
              router.push(`/dashboard/logistica/transferencias?origen=${seleccionado.id}`)
            }
          />
        </div>
      )}

      {mostrarCrear && (
        <CrearCentroDialog onClose={() => setMostrarCrear(false)} onCreado={() => void refetch()} />
      )}
    </div>
  );
}

function DetalleCentro({
  centro,
  profile,
  emergencias,
  tab,
  setTab,
  onActualizado,
  onEliminado,
  onNuevaTransferencia,
}: {
  centro: CentroDetalle;
  profile: ReturnType<typeof useUserProfile>['data'];
  emergencias: Emergencia[];
  tab: DetalleTab;
  setTab: (t: DetalleTab) => void;
  onActualizado: () => void;
  onEliminado: () => void;
  onNuevaTransferencia: () => void;
}) {
  const etiquetaEmergencia = etiquetaEmergenciaPorId(centro.emergenciaId, emergencias);
  const eliminar = useEliminarCentro();
  const puedeEliminar = puedeEditarCentro(profile);

  const handleEliminar = () => {
    const ok = window.confirm(
      `¿Eliminar el centro "${centro.nombre}"? Se marcará como CERRADO y dejará de aparecer en las listas. ` +
        'Su historial de inventario y movimientos se conserva.'
    );
    if (!ok) return;
    eliminar.mutate(centro.id, { onSuccess: onEliminado });
  };

  return (
    <div className="logistics-panel" style={{ padding: '1.25rem' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '1rem', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Warehouse size={18} /> {centro.nombre}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 500, color: '#0d9488' }}>
            {etiquetaEmergencia ?? 'Sin emergencia activa'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="logistics-btn logistics-btn--secondary" onClick={onNuevaTransferencia}>
            <ArrowLeftRight size={14} /> Nueva transferencia desde este centro
          </button>
          {puedeEliminar && (
            <button
              type="button"
              className="logistics-btn logistics-btn--danger"
              onClick={handleEliminar}
              disabled={eliminar.isPending}
            >
              <Trash2 size={14} /> {eliminar.isPending ? 'Eliminando…' : 'Eliminar centro'}
            </button>
          )}
        </div>
      </div>
      {eliminar.isError && (
        <div className="logistics-empty" style={{ color: '#fca5a5', marginBottom: '0.75rem' }}>
          No se pudo eliminar el centro: {formatApiError(eliminar.error)}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        <button
          type="button"
          className={`logistics-btn logistics-btn--sm ${tab === 'detalle' ? 'logistics-btn--primary' : 'logistics-btn--secondary'}`}
          onClick={() => setTab('detalle')}
        >
          <Settings2 size={13} /> Detalle y operadores
        </button>
        <button
          type="button"
          className={`logistics-btn logistics-btn--sm ${tab === 'inventario' ? 'logistics-btn--primary' : 'logistics-btn--secondary'}`}
          onClick={() => setTab('inventario')}
        >
          <Boxes size={13} /> Inventario
        </button>
      </div>

      {tab === 'detalle' ? (
        <CentroDetalleEditor
          centro={centro}
          profile={profile}
          emergencias={emergencias}
          onActualizado={onActualizado}
        />
      ) : (
        <CentroInventarioPanel centroId={centro.id} profile={profile} />
      )}
    </div>
  );
}
