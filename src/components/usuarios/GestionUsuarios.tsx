'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  Search,
  User,
  Shield,
  Mail,
  IdCard,
  Trash2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  useAssignRole,
  useChangeUserStatus,
  usePermisos,
  useRemoveRole,
  useRol,
  useRoles,
  useToggleRolePermission,
  useUsuario,
  useUsuarios,
} from '@/hooks/useIdentityAdmin';
import type { EstadoUsuario, UsuarioResponse } from '@/types/identity';
import { formatApiError } from '@/lib/api-errors';

type TabId = 'usuarios' | 'roles';

function estadoBadgeClass(estado: string): string {
  if (estado === 'ACTIVO') return 'usuarios-badge usuarios-badge--activo';
  if (estado === 'SUSPENDIDO') return 'usuarios-badge usuarios-badge--suspendido';
  return 'usuarios-badge usuarios-badge--inactivo';
}

function nombreCompleto(u: UsuarioResponse): string {
  return `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || u.correo;
}

export default function GestionUsuarios() {
  const [tab, setTab] = useState<TabId>('usuarios');
  const [busqueda, setBusqueda] = useState('');
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);
  const [rolAsignarId, setRolAsignarId] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState<EstadoUsuario>('ACTIVO');
  const [rolPermisosId, setRolPermisosId] = useState('');

  const { data: usuarios = [], isLoading: usuariosCargando, refetch: refetchUsuarios } = useUsuarios();
  const {
    data: roles = [],
    isLoading: rolesCargando,
    isError: rolesError,
    error: rolesErrorDetail,
    refetch: refetchRoles,
  } = useRoles();
  const {
    data: permisos = [],
    isLoading: permisosCargando,
    isError: permisosError,
    error: permisosErrorDetail,
    refetch: refetchPermisos,
  } = usePermisos();

  const {
    data: usuarioDetalle,
    isLoading: usuarioDetalleCargando,
    refetch: refetchUsuarioDetalle,
  } = useUsuario(seleccionadoId);

  const {
    data: rolDetalle,
    isLoading: rolDetalleCargando,
    refetch: refetchRolDetalle,
  } = useRol(rolPermisosId || null);

  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  const changeStatus = useChangeUserStatus();
  const togglePermiso = useToggleRolePermission();

  const seleccionado = useMemo(
    () => usuarioDetalle ?? usuarios.find((u) => u.id === seleccionadoId) ?? null,
    [usuarioDetalle, usuarios, seleccionadoId]
  );

  const rolesDisponiblesAsignar = useMemo(() => {
    if (!seleccionado) return [];
    const asignados = new Set(seleccionado.roles ?? []);
    return roles.filter((r) => r.activo && !asignados.has(r.nombre));
  }, [roles, seleccionado]);

  const rolSeleccionadoPermisos = useMemo(
    () => rolDetalle ?? roles.find((r) => r.id === rolPermisosId) ?? roles[0] ?? null,
    [rolDetalle, roles, rolPermisosId]
  );

  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => {
      const texto = [
        u.correo,
        u.nombres,
        u.apellidos,
        u.numeroDocumento,
        ...(u.roles ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return texto.includes(q);
    });
  }, [usuarios, busqueda]);

  useEffect(() => {
    if (!rolPermisosId && roles.length > 0) {
      setRolPermisosId(roles[0].id);
    }
  }, [roles, rolPermisosId]);

  const rolesPorNombre = useMemo(() => {
    const map = new Map<string, string>();
    roles.forEach((r) => map.set(r.nombre, r.id));
    return map;
  }, [roles]);

  const permisosPorModulo = useMemo(() => {
    const grupos: Record<string, typeof permisos> = {};
    permisos.forEach((p) => {
      const mod = p.modulo || 'GENERAL';
      if (!grupos[mod]) grupos[mod] = [];
      grupos[mod].push(p);
    });
    return Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b));
  }, [permisos]);

  const handleAsignarRol = async () => {
    if (!seleccionado || !rolAsignarId) {
      toast.error('Selecciona un rol para asignar');
      return;
    }
    try {
      await assignRole.mutateAsync({ userId: seleccionado.id, data: { rolId: rolAsignarId } });
      toast.success('Rol asignado');
      setRolAsignarId('');
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const handleQuitarRol = async (nombreRol: string) => {
    if (!seleccionado) return;
    const rolId = rolesPorNombre.get(nombreRol);
    if (!rolId) {
      toast.error('No se encontró el ID del rol');
      return;
    }
    try {
      await removeRole.mutateAsync({ userId: seleccionado.id, rolId });
      toast.success(`Rol ${nombreRol} eliminado`);
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const handleCambiarEstado = async () => {
    if (!seleccionado) return;
    try {
      await changeStatus.mutateAsync({ userId: seleccionado.id, data: { estado: nuevoEstado } });
      toast.success(`Estado actualizado a ${nuevoEstado}`);
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const handleTogglePermiso = async (permisoId: string, codigo: string, tiene: boolean) => {
    if (!rolSeleccionadoPermisos) return;
    try {
      await togglePermiso.mutateAsync({
        rolId: rolSeleccionadoPermisos.id,
        permisoId,
        asignar: !tiene,
      });
      toast.success(tiene ? `Permiso ${codigo} quitado` : `Permiso ${codigo} asignado`);
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div className="usuarios-page">
      <div className="usuarios-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'usuarios'}
          className={`usuarios-tab${tab === 'usuarios' ? ' usuarios-tab--active' : ''}`}
          onClick={() => setTab('usuarios')}
        >
          <User size={16} />
          Usuarios
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'roles'}
          className={`usuarios-tab${tab === 'roles' ? ' usuarios-tab--active' : ''}`}
          onClick={() => setTab('roles')}
        >
          <Shield size={16} />
          Roles y permisos
        </button>
        <button
          type="button"
          className="usuarios-btn-ghost usuarios-refresh"
          onClick={() => {
            void refetchUsuarios();
            void refetchRoles();
            void refetchPermisos();
            if (seleccionadoId) void refetchUsuarioDetalle();
            if (rolPermisosId) void refetchRolDetalle();
          }}
          title="Actualizar datos"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {tab === 'usuarios' && (
        <div className="usuarios-grid">
          <section className="usuarios-panel">
            <div className="usuarios-panel__head">
              <h2 className="usuarios-panel__title">Listado de usuarios</h2>
              <div className="usuarios-search">
                <Search size={14} />
                <input
                  type="search"
                  placeholder="Buscar por nombre, correo, rol…"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            {usuariosCargando ? (
              <div className="usuarios-empty">
                <Loader2 size={22} className="animate-spin" />
                Cargando usuarios…
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="usuarios-empty">No hay usuarios que coincidan.</div>
            ) : (
              <div className="usuarios-table-wrap">
                <table className="usuarios-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Estado</th>
                      <th>Roles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((u) => (
                      <tr
                        key={u.id}
                        className={seleccionadoId === u.id ? 'usuarios-table__row--selected' : ''}
                        onClick={() => {
                          setSeleccionadoId(u.id);
                          setNuevoEstado((u.estado as EstadoUsuario) || 'ACTIVO');
                        }}
                      >
                        <td>
                          <span className="usuarios-table__name">{nombreCompleto(u)}</span>
                          <span className="usuarios-table__sub">{u.correo}</span>
                        </td>
                        <td>
                          <span className={estadoBadgeClass(u.estado)}>{u.estado}</span>
                        </td>
                        <td>
                          <div className="usuarios-roles-inline">
                            {(u.roles ?? []).length === 0 ? (
                              <span className="usuarios-muted">Sin roles</span>
                            ) : (
                              u.roles.map((r) => (
                                <span key={r} className="usuarios-role-pill">
                                  {r}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="usuarios-panel usuarios-detail">
            {!seleccionado ? (
              <div className="usuarios-empty usuarios-empty--tall">
                <User size={32} strokeWidth={1.25} />
                <p>Selecciona un usuario para ver detalle, roles y permisos efectivos.</p>
              </div>
            ) : (
              <>
                {usuarioDetalleCargando && (
                  <p className="usuarios-hint">
                    <Loader2 size={14} className="animate-spin" /> Actualizando detalle…
                  </p>
                )}
                <h2 className="usuarios-panel__title">Detalle del usuario</h2>

                <dl className="usuarios-dl">
                  <div>
                    <dt><User size={14} /> Nombre</dt>
                    <dd>{nombreCompleto(seleccionado)}</dd>
                  </div>
                  <div>
                    <dt><Mail size={14} /> Correo</dt>
                    <dd>{seleccionado.correo}</dd>
                  </div>
                  <div>
                    <dt><IdCard size={14} /> Documento</dt>
                    <dd>
                      {seleccionado.tipoDocumento} {seleccionado.numeroDocumento}
                    </dd>
                  </div>
                  <div>
                    <dt>Firebase UID</dt>
                    <dd className="usuarios-mono">{seleccionado.firebaseUid}</dd>
                  </div>
                </dl>

                <div className="usuarios-section">
                  <h3>Roles asignados</h3>
                  {rolesError && (
                    <div className="usuarios-alert usuarios-alert--error">
                      No se pudieron cargar los roles: {formatApiError(rolesErrorDetail)}
                      <button type="button" className="usuarios-btn-ghost" onClick={() => void refetchRoles()}>
                        Reintentar
                      </button>
                    </div>
                  )}
                  <div className="usuarios-role-list">
                    {(seleccionado.roles ?? []).map((r) => (
                      <div key={r} className="usuarios-role-row">
                        <span className="usuarios-role-pill">{r}</span>
                        <button
                          type="button"
                          className="usuarios-btn-icon usuarios-btn-icon--danger"
                          title="Quitar rol"
                          onClick={() => void handleQuitarRol(r)}
                          disabled={removeRole.isPending}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="usuarios-form-row">
                    <select
                      className="usuarios-select"
                      value={rolAsignarId}
                      onChange={(e) => setRolAsignarId(e.target.value)}
                      disabled={rolesCargando || rolesError || rolesDisponiblesAsignar.length === 0}
                    >
                      <option value="">
                        {rolesCargando
                          ? 'Cargando roles…'
                          : rolesError
                            ? 'Error al cargar roles'
                            : rolesDisponiblesAsignar.length === 0
                              ? 'Sin roles disponibles'
                              : 'Asignar rol…'}
                      </option>
                      {rolesDisponiblesAsignar.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre}
                          {r.descripcion ? ` — ${r.descripcion}` : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="usuarios-btn-primary"
                      onClick={() => void handleAsignarRol()}
                      disabled={assignRole.isPending || !rolAsignarId}
                    >
                      <Plus size={14} />
                      Asignar
                    </button>
                  </div>
                </div>

                <div className="usuarios-section">
                  <h3>Estado de cuenta</h3>
                  <div className="usuarios-form-row">
                    <select
                      className="usuarios-select"
                      value={nuevoEstado}
                      onChange={(e) => setNuevoEstado(e.target.value as EstadoUsuario)}
                    >
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="INACTIVO">INACTIVO</option>
                      <option value="SUSPENDIDO">SUSPENDIDO</option>
                    </select>
                    <button
                      type="button"
                      className="usuarios-btn-secondary"
                      onClick={() => void handleCambiarEstado()}
                      disabled={changeStatus.isPending}
                    >
                      Actualizar estado
                    </button>
                  </div>
                </div>

                <div className="usuarios-section">
                  <h3>Permisos efectivos</h3>
                  <p className="usuarios-hint">
                    Calculados según los roles del usuario (solo lectura).
                  </p>
                  <div className="usuarios-permisos-grid">
                    {(seleccionado.permisos ?? []).length === 0 ? (
                      <span className="usuarios-muted">Sin permisos</span>
                    ) : (
                      seleccionado.permisos.map((p) => (
                        <span key={p} className="usuarios-perm-pill">
                          {p}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {tab === 'roles' && (
        <div className="usuarios-grid usuarios-grid--roles">
          <section className="usuarios-panel">
            <h2 className="usuarios-panel__title">Roles del sistema</h2>
            <p className="usuarios-hint">
              Catálogo desde la base de datos. Selecciona un rol para gestionar sus permisos.
            </p>

            {rolesError && (
              <div className="usuarios-alert usuarios-alert--error">
                No se pudieron cargar los roles: {formatApiError(rolesErrorDetail)}
                <button type="button" className="usuarios-btn-ghost" onClick={() => void refetchRoles()}>
                  Reintentar
                </button>
              </div>
            )}

            <div className="usuarios-form-row usuarios-form-row--stack">
              <label className="usuarios-label" htmlFor="rol-permisos-select">
                Rol
              </label>
              <select
                id="rol-permisos-select"
                className="usuarios-select"
                value={rolPermisosId}
                onChange={(e) => setRolPermisosId(e.target.value)}
                disabled={rolesCargando || roles.length === 0}
              >
                {rolesCargando ? (
                  <option value="">Cargando roles…</option>
                ) : roles.length === 0 ? (
                  <option value="">No hay roles en el sistema</option>
                ) : (
                  roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                      {r.descripcion ? ` — ${r.descripcion}` : ''}
                      {` (${r.permisos.length} permisos)`}
                    </option>
                  ))
                )}
              </select>
            </div>

            {rolesCargando ? (
              <div className="usuarios-empty">
                <Loader2 size={22} className="animate-spin" />
                Cargando roles…
              </div>
            ) : (
              <div className="usuarios-role-cards">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`usuarios-role-card${
                      rolSeleccionadoPermisos?.id === r.id ? ' usuarios-role-card--active' : ''
                    }`}
                    onClick={() => setRolPermisosId(r.id)}
                  >
                    <span className="usuarios-role-card__name">{r.nombre}</span>
                    <span className="usuarios-role-card__desc">{r.descripcion}</span>
                    <span className="usuarios-role-card__count">
                      {r.permisos.length} permiso{r.permisos.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="usuarios-panel">
            <h2 className="usuarios-panel__title">
              Permisos — {rolSeleccionadoPermisos?.nombre ?? '…'}
            </h2>
            {permisosError && (
              <div className="usuarios-alert usuarios-alert--error">
                No se pudieron cargar los permisos: {formatApiError(permisosErrorDetail)}
                <button type="button" className="usuarios-btn-ghost" onClick={() => void refetchPermisos()}>
                  Reintentar
                </button>
              </div>
            )}
            {!rolSeleccionadoPermisos ? (
              <div className="usuarios-empty">Selecciona un rol.</div>
            ) : permisosCargando || rolDetalleCargando ? (
              <div className="usuarios-empty">
                <Loader2 size={22} className="animate-spin" />
                Cargando permisos del rol…
              </div>
            ) : (
              <div className="usuarios-permisos-modulos">
                {permisosPorModulo.map(([modulo, items]) => (
                  <div key={modulo} className="usuarios-modulo">
                    <h3 className="usuarios-modulo__title">{modulo}</h3>
                    <ul className="usuarios-perm-list">
                      {items.map((p) => {
                        const tiene = rolSeleccionadoPermisos.permisos.includes(p.codigo);
                        return (
                          <li key={p.id} className="usuarios-perm-item">
                            <label className="usuarios-perm-label">
                              <input
                                type="checkbox"
                                checked={tiene}
                                disabled={togglePermiso.isPending || !p.activo}
                                onChange={() =>
                                  void handleTogglePermiso(p.id, p.codigo, tiene)
                                }
                              />
                              <span>
                                <strong>{p.codigo}</strong>
                                <small>{p.descripcion}</small>
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
