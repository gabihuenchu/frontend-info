'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PackagePlus, SlidersHorizontal, Boxes } from 'lucide-react';
import {
  useActualizarUmbrales,
  useInventarioItems,
  useRegistrarMovimiento,
  useResumenCategorias,
} from '@/hooks/useResources';
import { useCatalogItems } from '@/hooks/useCatalogItems';
import { formatApiError } from '@/lib/api-errors';
import { puedeConfigurarUmbrales, puedeRegistrarMovimientos } from '@/lib/resources-permissions';
import type { PerfilConPermisos } from '@/lib/logistics-permissions';
import {
  ETIQUETA_CRITICIDAD,
  type EstadoCriticidadInventario,
  type InventarioItem,
  type TipoMovimiento,
} from '@/types/resources';
import type { ItemCatalogo } from '@/types/catalog';

/** Fila de la tabla: ítem ya inventariado o ítem del catálogo aún sin stock (en 0). */
type FilaInventario =
  | { tipo: 'inventario'; item: InventarioItem }
  | { tipo: 'catalogo'; item: ItemCatalogo };

function criticidadBadgeClass(estado: EstadoCriticidadInventario): string {
  switch (estado) {
    case 'AGOTADO':
    case 'CRITICO':
      return 'nivel-badge nivel-alta';
    case 'SOBRESTOCK':
      return 'nivel-badge nivel-media';
    default:
      return 'nivel-badge nivel-baja';
  }
}

interface CentroInventarioPanelProps {
  centroId: string;
  profile: PerfilConPermisos | null | undefined;
}

export default function CentroInventarioPanel({ centroId, profile }: CentroInventarioPanelProps) {
  const { data: items = [], isLoading } = useInventarioItems(centroId);
  const { data: resumen = [] } = useResumenCategorias(centroId);
  const { data: catalogo = [] } = useCatalogItems();
  const registrar = useRegistrarMovimiento();
  const actualizarUmbrales = useActualizarUmbrales();

  const puedeMover = puedeRegistrarMovimientos(profile);
  const puedeUmbrales = puedeConfigurarUmbrales(profile);

  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimiento>('INGRESO');
  const [itemCatalogoId, setItemCatalogoId] = useState('');
  const [cantidad, setCantidad] = useState(1);

  const [editandoUmbralId, setEditandoUmbralId] = useState<string | null>(null);
  const [umbralForm, setUmbralForm] = useState({ minimo: 0, optimo: 0, maximo: 0 });

  const itemsPorCatalogo = useMemo(
    () => new Map(items.map((i) => [i.itemCatalogoId, i])),
    [items]
  );

  // Lista combinada: inventario real + ítems del catálogo aún sin stock (mostrados en 0)
  // para que el alta inicial sea evidente.
  const filas = useMemo<FilaInventario[]>(() => {
    const inventario: FilaInventario[] = items.map((item) => ({ tipo: 'inventario', item }));
    const faltantes: FilaInventario[] = catalogo
      .filter((c) => !itemsPorCatalogo.has(c.id))
      .map((c) => ({ tipo: 'catalogo', item: c }));
    return [...inventario, ...faltantes];
  }, [items, catalogo, itemsPorCatalogo]);

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCatalogoId) {
      toast.error('Selecciona un ítem del catálogo');
      return;
    }
    if (cantidad < 1) {
      toast.error('La cantidad debe ser al menos 1');
      return;
    }
    const existente = itemsPorCatalogo.get(itemCatalogoId);
    if (tipoMovimiento === 'EGRESO' && (!existente || cantidad > existente.stockActual)) {
      toast.error('No hay stock suficiente para el egreso');
      return;
    }
    try {
      const res = await registrar.mutateAsync({
        centroId,
        data: { itemCatalogoId, tipoMovimiento, cantidad },
      });
      toast.success(
        `${tipoMovimiento === 'INGRESO' ? 'Ingreso' : 'Egreso'} de ${res.cantidad} · ${res.itemNombre} (stock ${res.stockActual})`
      );
      setItemCatalogoId('');
      setCantidad(1);
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const iniciarEdicionUmbral = (item: InventarioItem) => {
    setEditandoUmbralId(item.itemCatalogoId);
    setUmbralForm({
      minimo: item.umbralMinimo,
      optimo: item.umbralOptimo,
      maximo: item.umbralMaximo,
    });
  };

  const guardarUmbral = async (item: InventarioItem) => {
    if (umbralForm.minimo > umbralForm.optimo || umbralForm.optimo > umbralForm.maximo) {
      toast.error('Debe cumplirse mínimo ≤ óptimo ≤ máximo');
      return;
    }
    try {
      await actualizarUmbrales.mutateAsync({
        centroId,
        data: {
          itemCatalogoId: item.itemCatalogoId,
          umbralMinimo: umbralForm.minimo,
          umbralOptimo: umbralForm.optimo,
          umbralMaximo: umbralForm.maximo,
        },
      });
      toast.success(`Umbrales actualizados para ${item.itemNombre}. Se recalculó la criticidad.`);
      setEditandoUmbralId(null);
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Resumen por categoría */}
      <div className="logistics-panel" style={{ padding: '1rem' }}>
        <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Boxes size={16} /> Resumen por categoría
        </h4>
        {resumen.length === 0 ? (
          <p className="logistics-hint">Sin inventario registrado aún.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {resumen.map((r) => (
              <div
                key={r.codigoCategoria}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  padding: '6px 10px',
                  borderRadius: 10,
                  border: '1px solid var(--border-default, rgba(255,255,255,0.12))',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600 }}>{r.nombreCategoria}</span>
                <span style={{ fontSize: 11, opacity: 0.85 }}>
                  Total {r.stockTotal}{' '}
                  <span className={criticidadBadgeClass(r.estadoCriticidadAgregado)}>
                    {ETIQUETA_CRITICIDAD[r.estadoCriticidadAgregado]}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registrar movimiento */}
      {puedeMover && (
        <div className="logistics-panel" style={{ padding: '1rem' }}>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <PackagePlus size={16} /> Registrar movimiento
          </h4>
          <form className="logistics-form logistics-form--wide" onSubmit={handleRegistrar}>
            <label>
              Tipo
              <select
                value={tipoMovimiento}
                onChange={(e) => setTipoMovimiento(e.target.value as TipoMovimiento)}
              >
                <option value="INGRESO">Ingreso (sumar stock / agregar ítem)</option>
                <option value="EGRESO">Egreso (descontar stock)</option>
              </select>
            </label>
            <label>
              Ítem de catálogo
              <select value={itemCatalogoId} onChange={(e) => setItemCatalogoId(e.target.value)} required>
                <option value="">Selecciona un ítem…</option>
                {catalogo.map((it) => {
                  const enInv = itemsPorCatalogo.get(it.id);
                  return (
                    <option key={it.id} value={it.id}>
                      {it.nombre} ({it.nombreCategoria}){enInv ? ` — stock ${enInv.stockActual}` : ' — nuevo'}
                    </option>
                  );
                })}
              </select>
            </label>
            <label>
              Cantidad
              <input
                type="number"
                min={1}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
            </label>
            <button type="submit" className="logistics-btn logistics-btn--primary" disabled={registrar.isPending}>
              {registrar.isPending ? 'Registrando…' : 'Registrar movimiento'}
            </button>
          </form>
        </div>
      )}

      {/* Tabla de inventario por ítem */}
      <div className="logistics-panel">
        <div className="logistics-panel__head">Inventario por ítem</div>
        {isLoading ? (
          <div className="logistics-empty">Cargando inventario…</div>
        ) : filas.length === 0 ? (
          <div className="logistics-empty">
            No hay ítems de catálogo disponibles. Usa “Registrar movimiento” (ingreso) para agregar ítems.
          </div>
        ) : (
          <div className="logistics-table-wrap">
            <table className="logistics-table">
              <thead>
                <tr>
                  <th>Ítem</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Criticidad</th>
                  <th>Mín / Ópt / Máx</th>
                  {puedeUmbrales && <th>Umbrales</th>}
                </tr>
              </thead>
              <tbody>
                {filas.map((fila) => {
                  if (fila.tipo === 'catalogo') {
                    const c = fila.item;
                    return (
                      <tr key={`cat-${c.id}`} style={{ opacity: 0.6 }}>
                        <td>{c.nombre}</td>
                        <td>{c.nombreCategoria}</td>
                        <td>
                          <strong>0</strong> {c.unidadMedida}
                        </td>
                        <td>
                          <span className="logistics-hint">Sin stock</span>
                        </td>
                        <td>—</td>
                        {puedeUmbrales && (
                          <td>
                            {puedeMover ? (
                              <button
                                type="button"
                                className="logistics-btn logistics-btn--secondary logistics-btn--sm"
                                onClick={() => {
                                  setTipoMovimiento('INGRESO');
                                  setItemCatalogoId(c.id);
                                }}
                              >
                                <PackagePlus size={13} /> Agregar
                              </button>
                            ) : (
                              '—'
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  }
                  const item = fila.item;
                  const editando = editandoUmbralId === item.itemCatalogoId;
                  return (
                    <tr key={item.id}>
                      <td>{item.itemNombre}</td>
                      <td>{item.nombreCategoria}</td>
                      <td>
                        <strong>{item.stockActual}</strong> {item.unidadMedida}
                      </td>
                      <td>
                        <span className={criticidadBadgeClass(item.estadoCriticidad)}>
                          {ETIQUETA_CRITICIDAD[item.estadoCriticidad]}
                        </span>
                      </td>
                      {!editando ? (
                        <td>
                          {item.umbralMinimo} / {item.umbralOptimo} / {item.umbralMaximo}
                        </td>
                      ) : (
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <input
                              type="number"
                              min={0}
                              style={{ width: 56 }}
                              value={umbralForm.minimo}
                              onChange={(e) => setUmbralForm({ ...umbralForm, minimo: Number(e.target.value) })}
                            />
                            <input
                              type="number"
                              min={0}
                              style={{ width: 56 }}
                              value={umbralForm.optimo}
                              onChange={(e) => setUmbralForm({ ...umbralForm, optimo: Number(e.target.value) })}
                            />
                            <input
                              type="number"
                              min={0}
                              style={{ width: 56 }}
                              value={umbralForm.maximo}
                              onChange={(e) => setUmbralForm({ ...umbralForm, maximo: Number(e.target.value) })}
                            />
                          </div>
                        </td>
                      )}
                      {puedeUmbrales && (
                        <td>
                          {!editando ? (
                            <button
                              type="button"
                              className="logistics-btn logistics-btn--secondary logistics-btn--sm"
                              onClick={() => iniciarEdicionUmbral(item)}
                            >
                              <SlidersHorizontal size={13} /> Ajustar
                            </button>
                          ) : (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button
                                type="button"
                                className="logistics-btn logistics-btn--primary logistics-btn--sm"
                                onClick={() => void guardarUmbral(item)}
                                disabled={actualizarUmbrales.isPending}
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                className="logistics-btn logistics-btn--secondary logistics-btn--sm"
                                onClick={() => setEditandoUmbralId(null)}
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!puedeUmbrales && items.length > 0 && (
          <p className="logistics-hint" style={{ padding: '0.5rem 1rem' }}>
            El ajuste de umbrales de criticidad está restringido al rol ADMINISTRADOR.
          </p>
        )}
      </div>
    </div>
  );
}
