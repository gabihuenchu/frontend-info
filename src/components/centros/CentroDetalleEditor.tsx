'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save, UserPlus, Users } from 'lucide-react';
import { useActualizarCentro, useAsignarOperador, useOperadoresCentro } from '@/hooks/useResources';
import { formatApiError } from '@/lib/api-errors';
import { puedeAsignarOperadores, puedeEditarCentro } from '@/lib/resources-permissions';
import type { PerfilConPermisos } from '@/lib/logistics-permissions';
import { etiquetaEmergencia, idCorto, type Emergencia } from '@/services/emergency.service';
import {
  ETIQUETA_ESTADO_CENTRO,
  type CentroDetalle,
  type EstadoCentro,
} from '@/types/resources';

const ESTADOS: EstadoCentro[] = ['ACTIVO', 'INACTIVO', 'SATURADO', 'CERRADO'];

interface CentroDetalleEditorProps {
  centro: CentroDetalle;
  profile: PerfilConPermisos | null | undefined;
  /** Emergencias activas para el selector "Emergencia relacionada". */
  emergencias?: Emergencia[];
  /** Callback tras una actualización exitosa (para invalidar listas en el padre). */
  onActualizado?: () => void;
}

export default function CentroDetalleEditor({
  centro,
  profile,
  emergencias = [],
  onActualizado,
}: CentroDetalleEditorProps) {
  const actualizar = useActualizarCentro();
  const puedeEditar = puedeEditarCentro(profile);
  const puedeOperadores = puedeAsignarOperadores(profile);

  const { data: operadores = [], isError: operadoresError } = useOperadoresCentro(
    centro.id,
    puedeEditar
  );
  const asignar = useAsignarOperador();

  const [form, setForm] = useState({
    nombre: centro.nombre,
    direccion: centro.direccion ?? '',
    region: centro.region ?? '',
    comuna: centro.comuna ?? '',
    capacidad: centro.capacidad != null ? String(centro.capacidad) : '',
    horario: centro.horario ?? '',
    estado: centro.estado,
    emergenciaId: centro.emergenciaId ?? '',
  });
  const [nuevoOperadorId, setNuevoOperadorId] = useState('');

  useEffect(() => {
    setForm({
      nombre: centro.nombre,
      direccion: centro.direccion ?? '',
      region: centro.region ?? '',
      comuna: centro.comuna ?? '',
      capacidad: centro.capacidad != null ? String(centro.capacidad) : '',
      horario: centro.horario ?? '',
      estado: centro.estado,
      emergenciaId: centro.emergenciaId ?? '',
    });
  }, [centro.id, centro.emergenciaId]);

  // El centro puede estar asociado a una emergencia que ya no está activa: la agregamos
  // al selector para no perder la referencia (con un código corto legible).
  const emergenciaActualFueraDeLista =
    centro.emergenciaId && !emergencias.some((e) => e.id === centro.emergenciaId);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const emergenciaCambio = form.emergenciaId && form.emergenciaId !== (centro.emergenciaId ?? '');
    try {
      await actualizar.mutateAsync({
        id: centro.id,
        data: {
          nombre: form.nombre.trim() || undefined,
          direccion: form.direccion.trim() || undefined,
          region: form.region.trim() || undefined,
          comuna: form.comuna.trim() || undefined,
          capacidad: form.capacidad ? Number(form.capacidad) : undefined,
          horario: form.horario.trim() || undefined,
          estado: form.estado,
          // El backend solo asocia (no desasocia); solo enviamos si cambió a un valor no vacío.
          emergenciaId: emergenciaCambio ? form.emergenciaId : undefined,
        },
      });
      toast.success('Centro actualizado');
      onActualizado?.();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const handleAsignar = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = nuevoOperadorId.trim();
    if (!id) {
      toast.error('Ingresa el ID de usuario del operador');
      return;
    }
    try {
      await asignar.mutateAsync({ centroId: centro.id, data: { usuarioId: id } });
      toast.success('Operador asignado');
      setNuevoOperadorId('');
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="logistics-panel" style={{ padding: '1rem' }}>
        <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem' }}>Datos del centro</h4>
        <form className="logistics-form logistics-form--wide" onSubmit={handleGuardar}>
          <label>
            Nombre
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              disabled={!puedeEditar}
              maxLength={200}
            />
          </label>
          <label>
            Dirección
            <input
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              disabled={!puedeEditar}
              maxLength={500}
            />
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <label style={{ flex: 1 }}>
              Región
              <input
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                disabled={!puedeEditar}
                maxLength={100}
              />
            </label>
            <label style={{ flex: 1 }}>
              Comuna
              <input
                value={form.comuna}
                onChange={(e) => setForm({ ...form, comuna: e.target.value })}
                disabled={!puedeEditar}
                maxLength={100}
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <label style={{ flex: 1 }}>
              Capacidad
              <input
                type="number"
                min={1}
                value={form.capacidad}
                onChange={(e) => setForm({ ...form, capacidad: e.target.value })}
                disabled={!puedeEditar}
              />
            </label>
            <label style={{ flex: 1 }}>
              Estado
              <select
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoCentro })}
                disabled={!puedeEditar}
              >
                {ESTADOS.map((es) => (
                  <option key={es} value={es}>
                    {ETIQUETA_ESTADO_CENTRO[es]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Horario
            <input
              value={form.horario}
              onChange={(e) => setForm({ ...form, horario: e.target.value })}
              disabled={!puedeEditar}
              maxLength={200}
              placeholder="Ej: Lun a Vie 9:00–18:00"
            />
          </label>
          <label>
            Emergencia relacionada
            <select
              value={form.emergenciaId}
              onChange={(e) => setForm({ ...form, emergenciaId: e.target.value })}
              disabled={!puedeEditar}
            >
              <option value="">Sin emergencia asignada</option>
              {emergenciaActualFueraDeLista && (
                <option value={centro.emergenciaId as string}>
                  Emergencia #{idCorto(centro.emergenciaId)} (no activa)
                </option>
              )}
              {emergencias.map((em) => (
                <option key={em.id} value={em.id}>
                  {etiquetaEmergencia(em)}
                </option>
              ))}
            </select>
            <span className="logistics-hint" style={{ marginTop: 4 }}>
              Selecciona una emergencia activa para asociarla a este centro. (No es posible desasociar
              una vez guardada.)
            </span>
          </label>
          {puedeEditar && (
            <button type="submit" className="logistics-btn logistics-btn--primary" disabled={actualizar.isPending}>
              <Save size={14} /> {actualizar.isPending ? 'Guardando…' : 'Guardar cambios'}
            </button>
          )}
          {!puedeEditar && (
            <p className="logistics-hint">No tienes permiso para editar este centro (requiere rol Administrador/Autoridad o permiso CENTRO_EDITAR).</p>
          )}
        </form>
      </div>

      {puedeEditar && (
        <div className="logistics-panel" style={{ padding: '1rem' }}>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={16} /> Operadores asignados
          </h4>
          {operadoresError ? (
            <p className="logistics-hint logistics-hint--error">No se pudieron cargar los operadores.</p>
          ) : operadores.length === 0 ? (
            <p className="logistics-hint">Sin operadores asignados.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.75rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {operadores.map((op) => (
                <li
                  key={op.id}
                  style={{ fontSize: 12, fontFamily: 'monospace', opacity: 0.9 }}
                  title={`Asignado: ${op.asignadoEn}`}
                >
                  {op.usuarioId}
                </li>
              ))}
            </ul>
          )}
          {puedeOperadores && (
            <form className="logistics-form" onSubmit={handleAsignar} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <label style={{ flex: 1 }}>
                ID de usuario operador
                <input
                  value={nuevoOperadorId}
                  onChange={(e) => setNuevoOperadorId(e.target.value)}
                  placeholder="UUID del usuario"
                />
              </label>
              <button type="submit" className="logistics-btn logistics-btn--secondary" disabled={asignar.isPending}>
                <UserPlus size={14} /> Asignar
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
