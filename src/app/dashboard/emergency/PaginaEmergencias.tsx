"use client";

/**
 * PaginaEmergencias.tsx
 * Dashboard principal — consume API real a través de useEmergencies hooks
 * + Panel de análisis IA con Anthropic API (claude-sonnet-4-20250514)
 */

import { useState, useCallback, useRef, useEffect, useMemo, type ReactNode } from "react";
import { useDashboardTheme } from "@/providers/DashboardThemeProvider";
import EmergencyMapGoogle, {
  type HerramientaZonaMapa,
  type CentroPersistidoMapa,
} from "@/components/emergency/EmergencyMapGoogle";
import type { SolicitudCentroAcopioRequest } from "@/services/emergency.service";
import AnuncioCardEditable from "@/components/emergency/AnuncioCardEditable";
import {
  useEmergenciasActivas,
  useEmergenciasGeoJson,
  useCreateEmergencia,
  useUpdateEstadoEmergencia,
  useDeleteEmergencia,
  useEmergenciasKpis,
  useCentrosAcopio,
  useAnuncios,
  useUpdateAnuncio,
} from "@/hooks/useEmergencies";
import { useCentrosDetalle, useCrearCentro } from "@/hooks/useResources";
import { useGoogleMapsApiKey } from "@/hooks/useGoogleMaps";
import type { CentroDetalle, EstadoCentro } from "@/types/resources";
import type {
  Emergencia,
  NivelAlerta,
  EstadoEmergencia,
  TipoEmergencia,
  NivelSeveridad,
  CrearEmergenciaRequest,
  AnuncioResponseDto,
  ActualizarAnuncioRequest,
} from "@/services/emergency.service";
import {
  mapTipoUiABackend,
  cerrarAnilloZona,
  centroidEpicentro,
  severidadUiAApi,
  isCentrosAcopioApiEnabled,
  prepararZonaImpactoParaApi,
  etiquetaEmergenciaPorId,
  MIN_VERTICES_ZONA_IMPACTO,
} from "@/services/emergency.service";
import { formatApiError } from "@/lib/api-errors";
import {
  Flame, Waves, Home, Zap, Mountain, CloudRain,
  Square, Pencil, Trash2, ClipboardList, AlertTriangle,
  Warehouse, Clock, MapPin, Edit3, Bell, FolderKanban,
  TrendingUp, Users, Truck, Plane, Moon, Sun,
  RefreshCw, AlertCircle, Brain, Send, Loader2, X,
} from "lucide-react";

// ─── Helpers UI ───────────────────────────────────────────────────────────────

const iconosPorTipo: Record<string, React.ReactNode> = {
  TERREMOTO: <Zap size={16} />,
  TSUNAMI: <Waves size={16} />,
  INCENDIO: <Flame size={16} />,
  INUNDACION: <CloudRain size={16} />,
  ERUPCION: <Mountain size={16} />,
  ALUVION: <Mountain size={16} />,
  "Incendios Forestales": <Flame size={16} />,
  "Alerta de Tsunami": <Waves size={16} />,
  Inundaciones: <CloudRain size={16} />,
  Terremoto: <Zap size={16} />,
  SISMO: <Zap size={16} />,
  "Erupción Volcánica": <Mountain size={16} />,
  Aluvión: <Mountain size={16} />,
  INFRAESTRUCTURA: <Home size={16} />,
  MAREJADA: <Waves size={16} />,
};

const nivelIconoBgClass: Record<string, string> = {
  ALTA: "icon-alta", MEDIA: "icon-media", BAJA: "icon-baja",
  CRITICA: "icon-alta",
};

const nivelBadgeClass: Record<string, string> = {
  ALTA:   "nivel-badge nivel-alta",
  MEDIA:  "nivel-badge nivel-media",
  BAJA:   "nivel-badge nivel-baja",
  CRITICA:"nivel-badge nivel-alta",
};

const estadoLabel: Record<EstadoEmergencia, string> = {
  ACTIVA: "Activa",
  CONTROLADA: "Controlada",
  FINALIZADA: "Finalizada",
};

/** Etiqueta y clase de pill para el estado real del centro (EstadoCentro). */
const estadoCentroPill: Record<EstadoCentro, { label: string; clase: string }> = {
  ACTIVO:   { label: "Activo",    clase: "estado-pill estado-abierto" },
  SATURADO: { label: "Saturado",  clase: "estado-pill estado-evaluacion" },
  INACTIVO: { label: "Inactivo",  clase: "estado-pill estado-cerrado" },
  CERRADO:  { label: "Cerrado",   clase: "estado-pill estado-cerrado" },
};

// ─── (Marcadores legacy eliminados: el mapa usa @react-google-maps/api) ───────

// ─── Estados genéricos ────────────────────────────────────────────────────────

const LoadingState = () => (
  <div className="loading-container">
    <Loader2 size={32} className="animate-spin" />
    <p style={{ marginTop: 12 }}>Cargando emergencias...</p>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <div className="error-container">
    <AlertCircle size={48} />
    <h3>Error al cargar emergencias</h3>
    <p>{error.message}</p>
    <button onClick={onRetry} className="btn-guardar" style={{ marginTop: 12 }}>
      <RefreshCw size={14} style={{ marginRight: 6 }} /> Reintentar
    </button>
  </div>
);

// ─── Panel de IA ──────────────────────────────────────────────────────────────

interface AIMensaje {
  role: "user" | "assistant";
  content: string;
}

function PanelIA({
  emergencias,
  onClose,
}: {
  emergencias: Emergencia[];
  onClose: () => void;
}) {
  const [mensajes, setMensajes] = useState<AIMensaje[]>([
    {
      role: "assistant",
      content:
        "Hola, soy Claude. Analizo las emergencias activas del sistema. Puedo ayudarte a priorizar respuestas, evaluar riesgos o sugerir recursos. ¿En qué te puedo ayudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando]);

  const contexto = emergencias
    .map(
      (e) =>
        `• ${e.titulo ?? e.tipo} | Tipo: ${e.tipo} | Severidad: ${e.severidad} | Estado: ${e.estado} | Región: ${e.region}`
    )
    .join("\n");

  const enviar = useCallback(
    async (texto: string) => {
      if (!texto.trim() || cargando) return;
      const nuevosMensajes: AIMensaje[] = [
        ...mensajes,
        { role: "user", content: texto },
      ];
      setMensajes(nuevosMensajes);
      setInput("");
      setCargando(true);

      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: `Eres un asistente experto en gestión de emergencias en Chile. Responde siempre en español, de forma concisa y práctica (máx. 4 oraciones). 

Estado actual del sistema de emergencias:
${contexto || "No hay emergencias activas en este momento."}`,
            messages: nuevosMensajes,
          }),
        });

        const data = await res.json();
        const respuesta =
          data.content?.find((b: { type: string }) => b.type === "text")?.text ??
          "No se pudo obtener respuesta.";

        setMensajes((prev) => [...prev, { role: "assistant", content: respuesta }]);
      } catch {
        setMensajes((prev) => [
          ...prev,
          { role: "assistant", content: "Error al conectar con la API de IA. Verifica tu conexión." },
        ]);
      } finally {
        setCargando(false);
      }
    },
    [mensajes, cargando, contexto]
  );

  const accesosRapidos = [
    "¿Cuáles son las emergencias más urgentes?",
    "Resume el estado general del sistema",
    "¿Qué recursos se necesitan ahora?",
    "Sugiere prioridades de respuesta",
  ];

  
}

// ─── Panel Derecho con Tabs ───────────────────────────────────────────────────

type VistaPanel = "detalles" | "crear-emergencia" | "centros" | "crear-centro" | "anuncios";

/** Centro de acopio en borrador colocado durante la creación de una emergencia. */
export type CentroAcopioBorrador = {
  id: string;
  nombre: string;
  capacidad: string;
  lat: number;
  lng: number;
};

function PanelDerecho({
  theme,
  vista,
  setVista,
  emergencia,
  centrosApiHabilitada,
  centrosDetalle,
  centrosDeEmergencia,
  resolverEtiquetaEmergencia,
  onSeleccionarCentro,
  centroSeleccionadoId,
  centrosCargando,
  anuncios,
  anunciosCargando,
  regionesAnuncio,
  onActualizarAnuncio,
  actualizandoAnuncioId,
  onEditarEmergencia,
  onIniciarCreacionNuevaEmergencia,
  onUpdateEstado,
  onDeleteEmergencia,
  onCrearEmergencia,
  onCrearCentro,
  editData,
  isCreating,
  isUpdating,
  isDeleting,
  herramientaMapa,
  setHerramientaMapa,
  epicentroPreview,
  cantidadVerticesZona,
  colocandoCentro,
  onToggleColocarCentro,
  centrosBorrador,
  onActualizarCentroBorrador,
  onEliminarCentroBorrador,
}: {
  theme: string;
  vista: VistaPanel;
  setVista: (v: VistaPanel) => void;
  emergencia: Emergencia | null;
  /** Centros vía gateway /centros-acopio; desactivar con NEXT_PUBLIC_ENABLE_CENTROS_ACOPIO=false */
  centrosApiHabilitada: boolean;
  /** Todos los centros con detalle (incluye emergenciaId) para la pestaña "Centros". */
  centrosDetalle: CentroDetalle[];
  /** Centros (con detalle) asociados a la emergencia seleccionada. */
  centrosDeEmergencia: CentroDetalle[];
  /** Devuelve la etiqueta legible de la emergencia del centro (o null si no tiene). */
  resolverEtiquetaEmergencia: (emergenciaId?: string | null) => string | null;
  /** Enfoca un centro en el mapa (pin + popup). */
  onSeleccionarCentro: (id: string) => void;
  centroSeleccionadoId: string | null;
  centrosCargando: boolean;
  anuncios: AnuncioResponseDto[];
  anunciosCargando: boolean;
  onEditarEmergencia: () => void;
  onIniciarCreacionNuevaEmergencia: () => void;
  onUpdateEstado: (estado: EstadoEmergencia) => void;
  onDeleteEmergencia: () => void;
  regionesAnuncio: string[];
  onActualizarAnuncio: (id: string, data: ActualizarAnuncioRequest) => Promise<void>;
  actualizandoAnuncioId: string | null;
  onCrearEmergencia: (data: {
    tipo: TipoEmergencia;
    severidad: NivelSeveridad;
    region: string;
    estado: EstadoEmergencia;
  }) => Promise<void>;
  onCrearCentro: (data: {
    nombre: string; direccion: string; ciudad: string;
    region: string; latitud?: number; longitud?: number; capacidad?: string;
  }) => Promise<void>;
  editData?: { tipo: string; nivel: string; nombre: string };
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  herramientaMapa: HerramientaZonaMapa;
  setHerramientaMapa: (h: HerramientaZonaMapa) => void;
  epicentroPreview: { latitud: number; longitud: number } | null;
  cantidadVerticesZona: number;
  colocandoCentro: boolean;
  onToggleColocarCentro: () => void;
  centrosBorrador: CentroAcopioBorrador[];
  onActualizarCentroBorrador: (id: string, patch: Partial<Pick<CentroAcopioBorrador, "nombre" | "capacidad">>) => void;
  onEliminarCentroBorrador: (id: string) => void;
}) {
  const [formEmergencia, setFormEmergencia] = useState({
    tipo: (editData?.tipo ?? "TERREMOTO") as TipoEmergencia,
    severidad: "ALTA" as NivelSeveridad,
    region: "",
    estado: "ACTIVA" as EstadoEmergencia,
  });

  const [errorCrear, setErrorCrear] = useState<string | null>(null);

  const [estadoPendiente, setEstadoPendiente] = useState<EstadoEmergencia>("ACTIVA");
  const [filtroRegionAnuncios, setFiltroRegionAnuncios] = useState("Todas las regiones");

  useEffect(() => {
    if (emergencia) {
      setEstadoPendiente(emergencia.estado);
    }
  }, [emergencia?.id, emergencia?.estado]);

  const [formCentro, setFormCentro] = useState({
    nombre: "", direccion: "", ciudad: "", region: "",
    latitud: "", longitud: "", capacidad: "",
  });
  const [errorCentro, setErrorCentro] = useState<string | null>(null);
  const [creandoCentro, setCreandoCentro] = useState(false);

  const herramientasZona: { id: HerramientaZonaMapa; icono: ReactNode; label: string }[] = [
    { id: "Dibujar zona", icono: <Square size={18} />, label: "Dibujar zona" },
    { id: "Editar zona",  icono: <Pencil size={18} />, label: "Editar zona" },
    { id: "Borrar zona",  icono: <Trash2 size={18} />, label: "Borrar zona" },
  ];

  const handleCrearEmergencia = async () => {
    if (!formEmergencia.region.trim()) {
      setErrorCrear("Ingresa la región de la emergencia.");
      return;
    }
    setErrorCrear(null);
    try {
      await onCrearEmergencia({ ...formEmergencia });
    } catch (err) {
      setErrorCrear(formatApiError(err));
    }
  };

  const handleCrearCentro = async () => {
    if (!formCentro.nombre.trim()) {
      setErrorCentro("Ingresa el nombre del centro.");
      return;
    }
    setErrorCentro(null);
    setCreandoCentro(true);
    try {
      await onCrearCentro({
        nombre: formCentro.nombre,
        direccion: formCentro.direccion,
        ciudad: formCentro.ciudad,
        region: formCentro.region,
        latitud: formCentro.latitud ? Number(formCentro.latitud) : undefined,
        longitud: formCentro.longitud ? Number(formCentro.longitud) : undefined,
        capacidad: formCentro.capacidad || undefined,
      });
      setFormCentro({
        nombre: "", direccion: "", ciudad: "", region: "",
        latitud: "", longitud: "", capacidad: "",
      });
    } catch (err) {
      setErrorCentro(formatApiError(err));
    } finally {
      setCreandoCentro(false);
    }
  };

  return (
    <div className={`panel-derecho-nuevo ${theme}`}>
      {/* Tabs */}
      <div className="panel-tabs-header">
        <button
          className={`panel-tab${vista === "detalles" ? " panel-tab--active" : ""}`}
          onClick={() => setVista("detalles")}
        >
          <ClipboardList size={14} className="mr-1" /> Detalles
        </button>
        <button
          className={`panel-tab${vista === "crear-emergencia" ? " panel-tab--active" : ""}`}
          onClick={() => {
            setFormEmergencia({ tipo: "TERREMOTO", severidad: "ALTA", region: "", estado: "ACTIVA" });
            setErrorCrear(null);
            onIniciarCreacionNuevaEmergencia();
          }}
        >
          <AlertTriangle size={14} className="mr-1" /> Crear Emergencia
        </button>
        {centrosApiHabilitada && (
        <button
          className={`panel-tab${(vista === "centros" || vista === "crear-centro") ? " panel-tab--active" : ""}`}
          onClick={() => setVista("centros")}
        >
          <Warehouse size={14} className="mr-1" /> Centros
        </button>
        )}
        <button
          className={`panel-tab${vista === "anuncios" ? " panel-tab--active" : ""}`}
          onClick={() => setVista("anuncios")}
        >
          <Bell size={14} className="mr-1" /> Anuncios
          {anuncios.length > 0 && <span className="count-badge" style={{ marginLeft: 4, fontSize: 9 }}>{anuncios.length}</span>}
        </button>
      </div>

      <div className="panel-derecho-content">

        {/* ── DETALLES ── */}
        {vista === "detalles" && emergencia && (
          <div className="panel-vista">
            <h3 className="panel-section-title">Detalle de Emergencia</h3>
            <div className="detalle-card">
              <div className="flex items-start justify-between gap-2" style={{ marginBottom: 8 }}>
                <div className="flex items-center gap-2">
                  <div className="detalle-icon-lg">
                    {iconosPorTipo[emergencia.tipo] ?? <AlertTriangle size={16} />}
                  </div>
                  <div>
                    <p className="detalle-nombre">{emergencia.tipo}</p>
                    <p className="detalle-region">{emergencia.region}</p>
                  </div>
                </div>
                <span className={nivelBadgeClass[emergencia.severidad] ?? "nivel-badge"}>
                  {emergencia.severidad}
                </span>
              </div>

              <div style={{ display: "grid", gap: 6, marginBottom: 10, fontSize: 12 }}>
                <p style={{ margin: 0 }}>
                  <strong>ID:</strong>{" "}
                  <span style={{ fontFamily: "monospace", fontSize: 11 }}>{emergencia.id}</span>
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Estado actual:</strong> {estadoLabel[emergencia.estado]}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Zona de impacto:</strong>{" "}
                  {emergencia.zonaImpacto?.coordinates?.[0]?.length
                    ? `${emergencia.zonaImpacto.coordinates[0].length} coordenadas (polígono)`
                    : "Sin polígono registrado"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Epicentro:</strong>{" "}
                  {emergencia.latitud.toFixed(5)}, {emergencia.longitud.toFixed(5)}
                </p>
              </div>

              {(emergencia.iniciada ?? emergencia.createdAt) && (
                <div className="emergencia-fecha" style={{ marginBottom: 8 }}>
                  <Clock size={14} />
                  <span>Iniciada: {emergencia.iniciada ?? new Date(emergencia.createdAt!).toLocaleString("es-CL")}</span>
                </div>
              )}

              {emergencia.descripcion ? (
                <p className="detalle-desc">{emergencia.descripcion}</p>
              ) : null}

              {(emergencia.comunasAfectadas != null || emergencia.hectareasQuemadas != null) && (
                <div className="detalle-kpis">
                  {emergencia.comunasAfectadas != null && (
                    <div className="kpi-cell">
                      <p className="kpi-valor">{emergencia.comunasAfectadas}</p>
                      <p className="kpi-label">Comunas afectadas</p>
                    </div>
                  )}
                  {emergencia.hectareasQuemadas != null && (
                    <div className="kpi-cell">
                      <p className="kpi-valor">{emergencia.hectareasQuemadas.toLocaleString("es-CL")}</p>
                      <p className="kpi-label">Hectáreas quemadas</p>
                    </div>
                  )}
                </div>
              )}

              <div className="panel-cambio-estado">
                <label className="panel-form-label">Cambiar estado</label>
                <p className="panel-estado-actual">
                  Guardado: <strong>{estadoLabel[emergencia.estado]}</strong>
                </p>
                <div className="panel-estado-opciones" role="group" aria-label="Seleccionar nuevo estado">
                  {(["ACTIVA", "CONTROLADA", "FINALIZADA"] as EstadoEmergencia[]).map((est) => {
                    const seleccionado = estadoPendiente === est;
                    const esActual = emergencia.estado === est;
                    return (
                      <button
                        key={est}
                        type="button"
                        aria-pressed={seleccionado}
                        className={[
                          "btn-estado-opcion",
                          `btn-estado-opcion--${est.toLowerCase()}`,
                          seleccionado ? "btn-estado-opcion--seleccionado" : "",
                          esActual ? "btn-estado-opcion--actual" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => setEstadoPendiente(est)}
                        disabled={isUpdating}
                      >
                        {estadoLabel[est]}
                        {esActual && <span className="btn-estado-opcion-badge">actual</span>}
                      </button>
                    );
                  })}
                </div>
                {estadoPendiente !== emergencia.estado ? (
                  <p className="panel-estado-pendiente">
                    Seleccionado: <strong>{estadoLabel[estadoPendiente]}</strong> — pulsa Guardar para aplicar
                  </p>
                ) : (
                  <p className="panel-estado-pendiente panel-estado-pendiente--igual">
                    El estado seleccionado coincide con el guardado
                  </p>
                )}
                <button
                  type="button"
                  className="btn-guardar btn-guardar-estado"
                  onClick={() => onUpdateEstado(estadoPendiente)}
                  disabled={isUpdating || estadoPendiente === emergencia.estado}
                >
                  {isUpdating ? "Guardando…" : "Guardar estado"}
                </button>
              </div>

              <div className="panel-detalle-actions">
                <button type="button" className="btn-informe btn-detalle-editar" onClick={onEditarEmergencia}>
                  <Edit3 size={14} /> EDITAR
                </button>
                <button
                  type="button"
                  className="btn-detalle-finalizar"
                  onClick={onDeleteEmergencia}
                  disabled={isDeleting}
                  title="Marca la emergencia como FINALIZADA en el servidor (no hay borrado físico)."
                >
                  <Trash2 size={14} />
                  {isDeleting ? 'Finalizando...' : 'Finalizar emergencia'}
                </button>
              </div>
            </div>

            {/* Centros de acopio de esta emergencia — solo si el MS de recursos está habilitado en build */}
            {centrosApiHabilitada && (
            <div style={{ marginTop: 20 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <h3 className="panel-section-title" style={{ margin: 0 }}>Centros de Acopio de la Emergencia</h3>
                <button className="btn-nueva-emergencia" style={{ fontSize: 10, padding: "4px 10px" }} onClick={() => setVista("crear-centro")}>
                  + Nuevo
                </button>
              </div>
              {centrosCargando ? (
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Cargando centros...</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {centrosDeEmergencia.map((c) => {
                    const pill = estadoCentroPill[c.estado];
                    return (
                      <button
                        key={c.id}
                        className={`centro-row${c.id === centroSeleccionadoId ? " centro-row--activo" : ""}`}
                        onClick={() => onSeleccionarCentro(c.id)}
                        title="Ver en el mapa"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <div>
                            <p className="centro-nombre">{c.nombre}</p>
                            <p className="centro-ciudad">
                              {[c.comuna, c.region].filter(Boolean).join(", ") || "Sin ubicación"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {c.capacidad != null && (
                            <span className="centro-distancia">{c.capacidad.toLocaleString("es-CL")}</span>
                          )}
                          <span className={pill?.clase ?? "estado-pill"}>{pill?.label ?? c.estado}</span>
                        </div>
                      </button>
                    );
                  })}
                  {centrosDeEmergencia.length === 0 && (
                    <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Esta emergencia no tiene centros de acopio asociados.</p>
                  )}
                </div>
              )}
            </div>
            )}
          </div>
        )}

        {vista === "detalles" && !emergencia && (
          <div className="panel-vista" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 12, color: "var(--color-text-secondary)" }}>
            <MapPin size={36} />
            <p style={{ fontSize: 13, textAlign: "center" }}>Selecciona una emergencia del mapa o lista para ver sus detalles.</p>
          </div>
        )}

        {/* ── CREAR/EDITAR EMERGENCIA ── */}
        {vista === "crear-emergencia" && (
          <div className="panel-vista">
            <div className="panel-form-header">
              <h2 className="panel-form-title">CREAR ZONA DE EMERGENCIA</h2>
              <p className="panel-form-subtitle">Completa los datos y guarda la emergencia</p>
            </div>

            <div className="panel-lateral-zona-tools">
              {herramientasZona.map((h) => (
                <button
                  key={h.id}
                  className={`zona-tool-btn${herramientaMapa === h.id ? " zona-tool-btn--active" : ""}`}
                  onClick={() => setHerramientaMapa(h.id)}
                >
                  <span className="zona-tool-icon">{h.icono}</span>
                  <span className="zona-tool-label">{h.label}</span>
                </button>
              ))}
            </div>

            <div className="panel-lateral-body" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="panel-form-label">Tipo de emergencia *</label>
                <div className="panel-form-select-wrap">
                  <span className="panel-form-icon">{iconosPorTipo[formEmergencia.tipo]}</span>
                  <select
                    className="panel-form-select"
                    value={formEmergencia.tipo}
                    onChange={(e) => setFormEmergencia({ ...formEmergencia, tipo: e.target.value as TipoEmergencia })}
                  >
                    {[
                      ["TERREMOTO", "Terremoto"],
                      ["TSUNAMI", "Tsunami / marejada"],
                      ["INCENDIO", "Incendio"],
                      ["INUNDACION", "Inundación"],
                      ["ERUPCION", "Erupción volcánica"],
                      ["ALUVION", "Aluvión"],
                    ].map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="panel-form-label">Severidad *</label>
                <div className="panel-form-select-wrap">
                  <span className={`panel-form-dot dot-${formEmergencia.severidad.toLowerCase()}`} />
                  <select
                    className="panel-form-select"
                    value={formEmergencia.severidad}
                    onChange={(e) => setFormEmergencia({ ...formEmergencia, severidad: e.target.value as NivelSeveridad })}
                  >
                    {["CRITICA","ALTA","MEDIA","BAJA"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="panel-form-label">Región *</label>
                <input
                  type="text"
                  className="panel-form-input"
                  placeholder="Ej: Valparaíso"
                  value={formEmergencia.region}
                  onChange={(e) => {
                    setErrorCrear(null);
                    setFormEmergencia({ ...formEmergencia, region: e.target.value });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="panel-form-label">Estado inicial *</label>
                <select
                  className="panel-form-select"
                  value={formEmergencia.estado}
                  onChange={(e) =>
                    setFormEmergencia({
                      ...formEmergencia,
                      estado: e.target.value as EstadoEmergencia,
                    })
                  }
                >
                  {(["ACTIVA", "CONTROLADA", "FINALIZADA"] as EstadoEmergencia[]).map((e) => (
                    <option key={e} value={e}>
                      {estadoLabel[e]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="panel-form-label">Epicentro y Zona de Impacto</label>
                {epicentroPreview ? (
                  <div className="panel-zona-hint panel-zona-hint--ok">
                    <p className="panel-zona-hint__title">
                      ✓ Zona válida ({cantidadVerticesZona} vértices → mín. {MIN_VERTICES_ZONA_IMPACTO})
                    </p>
                    <p className="panel-zona-hint__sub">
                      Epicentro: Lat {epicentroPreview.latitud.toFixed(5)} | Lng {epicentroPreview.longitud.toFixed(5)}
                    </p>
                  </div>
                ) : (
                  <div className="panel-zona-hint panel-zona-hint--warn">
                    <p className="panel-zona-hint__title">⚠️ Falta zona en el mapa</p>
                    <p className="panel-zona-hint__sub">
                      Usa &quot;Dibujar zona&quot; y marca al menos {MIN_VERTICES_ZONA_IMPACTO} vértices (polígono cerrado con 4+ coordenadas).
                    </p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="panel-form-label">Centros de acopio (opcional)</label>
                <button
                  type="button"
                  className={`zona-tool-btn${colocandoCentro ? " zona-tool-btn--active" : ""}`}
                  style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}
                  onClick={onToggleColocarCentro}
                >
                  <span className="zona-tool-icon"><Warehouse size={16} /></span>
                  <span className="zona-tool-label">
                    {colocandoCentro ? "Colocando centro… (clic en el mapa)" : "Colocar centro en el mapa"}
                  </span>
                </button>
                <p className="panel-zona-hint__sub" style={{ marginBottom: 8 }}>
                  Haz clic en el mapa para ubicar un centro y arrastra el pin para ajustarlo. Sus
                  inventarios se inicializan en 0 al crear la emergencia.
                </p>

                {centrosBorrador.length === 0 ? (
                  <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                    Aún no has colocado centros. (Opcional)
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {centrosBorrador.map((c, i) => (
                      <div
                        key={c.id}
                        style={{
                          border: "1px solid var(--border-default, rgba(255,255,255,0.12))",
                          borderRadius: 10,
                          padding: 10,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.8 }}>
                            <MapPin size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                            Centro {i + 1} · {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
                          </span>
                          <button
                            type="button"
                            className="card-action-btn"
                            onClick={() => onEliminarCentroBorrador(c.id)}
                            title="Quitar centro"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <input
                          type="text"
                          className="panel-form-input"
                          placeholder="Nombre del centro *"
                          value={c.nombre}
                          onChange={(e) => onActualizarCentroBorrador(c.id, { nombre: e.target.value })}
                        />
                        <input
                          type="number"
                          min={1}
                          className="panel-form-input"
                          placeholder="Capacidad estimada (opcional)"
                          value={c.capacidad}
                          onChange={(e) => onActualizarCentroBorrador(c.id, { capacidad: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>


            {errorCrear && (
              <div role="alert" className="panel-form-alert">
                <AlertCircle size={14} />
                <span>{errorCrear}</span>
              </div>
            )}

            <div className="panel-lateral-actions" style={{ marginTop: "auto", paddingTop: 16 }}>
              <button className="btn-panel-cancelar" onClick={() => setVista("detalles")}>Cancelar</button>
              <button
                className="btn-panel-guardar"
                onClick={() => void handleCrearEmergencia()}
                disabled={isCreating || !epicentroPreview}
              >
                {isCreating ? <><Loader2 size={12} className="animate-spin" style={{ marginRight: 4 }} /> Guardando...</> : "Guardar emergencia"}
              </button>
            </div>
          </div>
        )}

        {/* ── LISTA CENTROS ── */}
        {centrosApiHabilitada && vista === "centros" && (
          <div className="panel-vista">
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <h3 className="panel-section-title" style={{ margin: 0 }}>Centros de Acopio</h3>
              <button className="btn-nueva-emergencia" style={{ fontSize: 10, padding: "4px 10px" }} onClick={() => setVista("crear-centro")}>
                + Nuevo
              </button>
            </div>
            {centrosCargando ? (
              <div style={{ textAlign: "center", padding: 24, color: "var(--color-text-secondary)", fontSize: 13 }}>
                <Loader2 size={20} className="animate-spin" style={{ display: "block", margin: "0 auto 8px" }} />
                Cargando centros...
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {centrosDetalle.map((c) => {
                  const pill = estadoCentroPill[c.estado];
                  const etiqueta = resolverEtiquetaEmergencia(c.emergenciaId);
                  return (
                    <button
                      key={c.id}
                      className={`centro-row${c.id === centroSeleccionadoId ? " centro-row--activo" : ""}`}
                      onClick={() => onSeleccionarCentro(c.id)}
                      title="Ver en el mapa"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <div>
                          <p className="centro-nombre">{c.nombre}</p>
                          <p className="centro-ciudad">
                            {[c.comuna, c.region].filter(Boolean).join(", ") || "Sin ubicación"}
                          </p>
                          <p className="centro-emergencia">
                            {etiqueta ?? "Sin emergencia activa"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {c.capacidad != null && (
                          <span className="centro-distancia">{c.capacidad.toLocaleString("es-CL")}</span>
                        )}
                        <span className={pill?.clase ?? "estado-pill"}>{pill?.label ?? c.estado}</span>
                      </div>
                    </button>
                  );
                })}
                {centrosDetalle.length === 0 && (
                  <p style={{ fontSize: 12, color: "var(--color-text-secondary)", textAlign: "center", padding: 24 }}>
                    No hay centros de acopio registrados.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CREAR CENTRO ── */}
        {centrosApiHabilitada && vista === "crear-centro" && (
          <div className="panel-vista">
            <div className="panel-form-header">
              <h2 className="panel-form-title">CREAR CENTRO DE ACOPIO</h2>
              <p className="panel-form-subtitle">Registra nuevos centros para recibir donaciones</p>
            </div>

            <div className="panel-lateral-body" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="panel-form-label">Nombre del centro *</label>
                <input type="text" className="panel-form-input" placeholder="Ej: Gimnasio Municipal Quilpué" value={formCentro.nombre} onChange={(e) => setFormCentro({ ...formCentro, nombre: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="panel-form-label">Dirección</label>
                <input type="text" className="panel-form-input" placeholder="Ej: Av. Condell 1234, Quilpué" value={formCentro.direccion} onChange={(e) => setFormCentro({ ...formCentro, direccion: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="panel-form-label">Ciudad</label>
                  <input type="text" className="panel-form-input" placeholder="Quilpué" value={formCentro.ciudad} onChange={(e) => setFormCentro({ ...formCentro, ciudad: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="panel-form-label">Región</label>
                  <input type="text" className="panel-form-input" placeholder="Valparaíso" value={formCentro.region} onChange={(e) => setFormCentro({ ...formCentro, region: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="panel-form-label">Coordenadas (latitud : longitud) *</label>
                <div className="coords-wrap">
                  <input type="text" className="form-input" placeholder="-33.0389" value={formCentro.latitud} onChange={(e) => setFormCentro({ ...formCentro, latitud: e.target.value })} />
                  <span className="coords-sep">:</span>
                  <input type="text" className="form-input" placeholder="-71.4378" value={formCentro.longitud} onChange={(e) => setFormCentro({ ...formCentro, longitud: e.target.value })} />
                </div>
                <p className="panel-zona-hint__sub" style={{ marginTop: 6 }}>
                  Obligatorias. Puedes copiarlas desde Google Maps (clic derecho → coordenadas).
                </p>
              </div>
              <div className="form-group">
                <label className="panel-form-label">Capacidad estimada</label>
                <input
                  type="number"
                  min={1}
                  className="panel-form-input"
                  placeholder="Ej: 200 (opcional)"
                  value={formCentro.capacidad}
                  onChange={(e) => setFormCentro({ ...formCentro, capacidad: e.target.value })}
                />
              </div>

              {errorCentro && (
                <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errorCentro}</p>
              )}
            </div>

            <div className="panel-lateral-actions" style={{ marginTop: "auto", paddingTop: 16 }}>
              <button className="btn-panel-cancelar" onClick={() => setVista("centros")}>Cancelar</button>
              <button className="btn-panel-guardar" onClick={handleCrearCentro} disabled={creandoCentro}>
                {creandoCentro ? "Creando..." : "Crear centro"}
              </button>
            </div>
          </div>
        )}

        {vista === "anuncios" && (
          <div className="panel-vista">
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <h3 className="panel-section-title" style={{ margin: 0 }}>Anuncios y Notificaciones</h3>
              <div className="flex items-center gap-2">
                <span className="live-indicator"></span>
                <span style={{ fontSize: 10, color: "var(--color-text-secondary)", fontWeight: 600 }}>VIVO</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="panel-form-label">Filtrar por región</label>
              <select
                className="panel-form-select"
                value={filtroRegionAnuncios}
                onChange={(e) => setFiltroRegionAnuncios(e.target.value)}
              >
                <option>Todas las regiones</option>
                {regionesAnuncio.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {anunciosCargando && anuncios.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-secondary)" }}>
                <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: 13 }}>Sincronizando con RabbitMQ...</p>
              </div>
            ) : (
              <div className="anuncios-feed">
                {anuncios
                  .filter((a) => {
                    if (filtroRegionAnuncios === "Todas las regiones") return true;
                    return (a.region ?? "").toLowerCase() === filtroRegionAnuncios.toLowerCase();
                  })
                  .map((anuncio) => (
                    <AnuncioCardEditable
                      key={anuncio.id}
                      anuncio={anuncio}
                      regiones={regionesAnuncio}
                      onGuardar={onActualizarAnuncio}
                      guardando={actualizandoAnuncioId === anuncio.id}
                    />
                  ))}
                {anuncios.filter((a) => {
                  if (filtroRegionAnuncios === "Todas las regiones") return true;
                  return (a.region ?? "").toLowerCase() === filtroRegionAnuncios.toLowerCase();
                }).length === 0 && (
                  <div style={{ textAlign: "center", padding: 30, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <Bell size={24} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                    <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                      {anuncios.length === 0
                        ? "Esperando nuevas notificaciones..."
                        : "No hay anuncios para la región seleccionada."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

type BorradorLatLng = { lat: number; lng: number };

export default function PaginaEmergencias() {
  const { dark, theme } = useDashboardTheme();
  const googleMapsApiKey = useGoogleMapsApiKey();
  const [emergenciaSeleccionada, setEmergenciaSeleccionada] = useState<Emergencia | null>(null);
  const [panelVista, setPanelVista] = useState<VistaPanel>("detalles");
  const [editData, setEditData] = useState<{ tipo: string; nivel: string; nombre: string } | undefined>();
  const [filtroRegion, setFiltroRegion] = useState("Todas las regiones");
  const [filtroTipo, setFiltroTipo] = useState("Todos los tipos");
  const [herramientaMapa, setHerramientaMapa] = useState<HerramientaZonaMapa>("Dibujar zona");
  const [poligonoBorrador, setPoligonoBorrador] = useState<BorradorLatLng[] | null>(null);
  const [centrosBorrador, setCentrosBorrador] = useState<CentroAcopioBorrador[]>([]);
  const [colocandoCentro, setColocandoCentro] = useState(false);
  /** Centro de acopio enfocado en el mapa (pin + popup) al hacer clic en la lista. */
  const [centroSeleccionadoId, setCentroSeleccionadoId] = useState<string | null>(null);
  const [mostrarIA, setMostrarIA] = useState(false);
  /** Oculta el banner sin arreglar el 500; se resetea cuando el error desaparece. */
  const [ocultarBannerEmergencias, setOcultarBannerEmergencias] = useState(false);

  const centrosApiHabilitada = isCentrosAcopioApiEnabled();

  useEffect(() => {
    if (
      !centrosApiHabilitada &&
      (panelVista === "centros" || panelVista === "crear-centro")
    ) {
      setPanelVista("detalles");
    }
  }, [centrosApiHabilitada, panelVista]);

  /** Sin sondeo automático mientras se dibuja o hay polígono sin guardar (evita “recargas” que cortan el trazo). */
  const pausarSondeoEmergencias = useMemo(
    () =>
      panelVista === "crear-emergencia" &&
      (herramientaMapa === "Dibujar zona" || Boolean(poligonoBorrador?.length)),
    [panelVista, herramientaMapa, poligonoBorrador]
  );

  const intervaloEmergencias = pausarSondeoEmergencias ? false : 120_000;

  // ── Queries ──
  const {
    data: emergencias = [],
    isLoading,
    error,
    refetch,
  } = useEmergenciasActivas({ refetchInterval: intervaloEmergencias });

  const { data: geoJson, refetch: refetchGeoJson } = useEmergenciasGeoJson({
    refetchInterval: intervaloEmergencias,
  });

  const { data: centros = [], isLoading: centrosCargando, refetch: refetchCentros } = useCentrosAcopio();
  // Centros con detalle (incluye emergenciaId, estado y coordenadas) para dibujarlos en el mapa.
  const { data: centrosDetalle = [], refetch: refetchCentrosDetalle } = useCentrosDetalle();

  const { data: anunciosData, isLoading: anunciosCargando } = useAnuncios();
  const anuncios = anunciosData?.content || [];

  const epicentroPreview = useMemo(() => {
    if (!poligonoBorrador || poligonoBorrador.length < 3) return null;
    const ring = cerrarAnilloZona(
      poligonoBorrador.map((p) => ({ longitud: p.lng, latitud: p.lat }))
    );
    const c = centroidEpicentro(ring);
    return { latitud: c.latitud, longitud: c.longitud };
  }, [poligonoBorrador]);

  useEffect(() => {
    if (herramientaMapa === "Borrar zona") {
      setPoligonoBorrador(null);
      setHerramientaMapa("Dibujar zona");
    }
    if (herramientaMapa === "Editar zona") {
      setPoligonoBorrador(null);
      setHerramientaMapa("Dibujar zona");
    }
  }, [herramientaMapa]);

  useEffect(() => {
    if (!error) setOcultarBannerEmergencias(false);
  }, [error]);

  // Al salir del modo crear emergencia, desactiva la colocación de pines de centro.
  useEffect(() => {
    if (panelVista !== "crear-emergencia") setColocandoCentro(false);
  }, [panelVista]);

  const agregarCentroBorrador = useCallback((punto: { lat: number; lng: number }) => {
    setCentrosBorrador((prev) => [
      ...prev,
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `centro-${Date.now()}-${prev.length}`,
        nombre: "",
        capacidad: "",
        lat: punto.lat,
        lng: punto.lng,
      },
    ]);
  }, []);

  const moverCentroBorrador = useCallback((id: string, punto: { lat: number; lng: number }) => {
    setCentrosBorrador((prev) =>
      prev.map((c) => (c.id === id ? { ...c, lat: punto.lat, lng: punto.lng } : c))
    );
  }, []);

  const actualizarCentroBorrador = useCallback(
    (id: string, patch: Partial<Pick<CentroAcopioBorrador, "nombre" | "capacidad">>) => {
      setCentrosBorrador((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    },
    []
  );

  const eliminarCentroBorrador = useCallback((id: string) => {
    setCentrosBorrador((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ── Mutations ──
  const createMutation    = useCreateEmergencia();
  const updateMutation    = useUpdateEstadoEmergencia();
  const deleteMutation    = useDeleteEmergencia();
  const crearCentroMut    = useCrearCentro();
  const updateAnuncioMut  = useUpdateAnuncio();

  const kpis = useEmergenciasKpis(emergencias);

  // ── Filtros aplicados ──
  const emergenciasFiltradas = emergencias.filter((e) => {
    const regionOk = filtroRegion === "Todas las regiones" || e.region === filtroRegion;
    const tipoOk   = filtroTipo   === "Todos los tipos"   || e.tipo === filtroTipo;
    return regionOk && tipoOk;
  });

  const regiones = Array.from(new Set(emergencias.map((e) => e.region)));
  const tipos    = Array.from(new Set(emergencias.map((e) => e.tipo)));

  // ── Handlers ──
  const iniciarCreacionNuevaEmergencia = useCallback(() => {
    setEditData(undefined);
    setEmergenciaSeleccionada(null);
    setPoligonoBorrador(null);
    setCentrosBorrador([]);
    setColocandoCentro(false);
    setHerramientaMapa("Dibujar zona");
    setPanelVista("crear-emergencia");
  }, []);

  const abrirCrearEmergencia = useCallback((em?: Emergencia) => {
    if (em) {
      setEditData({
        tipo: em.tipo,
        nivel: em.severidad,
        nombre: em.titulo ?? em.tipo,
      });
      setEmergenciaSeleccionada(em);
      setPanelVista("crear-emergencia");
      return;
    }
    iniciarCreacionNuevaEmergencia();
  }, [iniciarCreacionNuevaEmergencia]);

  const seleccionarEmergencia = useCallback(
    (em: Emergencia, vista: VistaPanel = "detalles") => {
      setEmergenciaSeleccionada(em);
      setPanelVista(vista);
    },
    []
  );

  const onSelectEmergenciaId = useCallback(
    (id: string) => {
      if (panelVista === "crear-emergencia") return;
      const em = emergencias.find((e) => e.id === id);
      if (em) seleccionarEmergencia(em, "detalles");
    },
    [emergencias, panelVista, seleccionarEmergencia]
  );

  const enModoCrearEmergencia = panelVista === "crear-emergencia";
  const mapSelectedId = enModoCrearEmergencia ? null : emergenciaSeleccionada?.id ?? null;

  // Centros de la emergencia seleccionada (para el detalle y el mapa en vista "detalles").
  const centrosDeEmergencia = useMemo<CentroDetalle[]>(
    () =>
      emergenciaSeleccionada
        ? centrosDetalle.filter((c) => c.emergenciaId === emergenciaSeleccionada.id)
        : [],
    [centrosDetalle, emergenciaSeleccionada?.id]
  );

  // Centros a dibujar en el mapa según la vista activa:
  //  - crear emergencia: ninguno (solo se ven los pines de borrador)
  //  - centros / crear-centro: todos los centros activos
  //  - detalles: solo los de la emergencia seleccionada
  const centrosParaMapa = useMemo<CentroPersistidoMapa[]>(() => {
    if (enModoCrearEmergencia) return [];
    const mostrarTodos = panelVista === "centros" || panelVista === "crear-centro";
    const base = mostrarTodos ? centrosDetalle : centrosDeEmergencia;
    return base
      .filter((c) => typeof c.latitud === "number" && typeof c.longitud === "number")
      .map((c) => ({
        id: c.id,
        nombre: c.nombre,
        lat: c.latitud as number,
        lng: c.longitud as number,
        estado: c.estado,
        capacidad: c.capacidad,
        emergenciaId: c.emergenciaId,
      }));
  }, [enModoCrearEmergencia, panelVista, centrosDetalle, centrosDeEmergencia]);

  // Etiqueta legible de la emergencia asociada a un centro (o null si no tiene).
  const resolverEtiquetaEmergencia = useCallback(
    (emergenciaId?: string | null) => etiquetaEmergenciaPorId(emergenciaId, emergencias),
    [emergencias]
  );

  // Al cambiar de emergencia o de vista, cierra el popup del centro enfocado.
  useEffect(() => {
    setCentroSeleccionadoId(null);
  }, [emergenciaSeleccionada?.id, panelVista]);

  useEffect(() => {
    if (!emergenciaSeleccionada) return;
    const fresh = emergencias.find((e) => e.id === emergenciaSeleccionada.id);
    if (fresh) setEmergenciaSeleccionada(fresh);
  }, [emergencias, emergenciaSeleccionada?.id]);

  const handleActualizarAnuncio = useCallback(
    async (id: string, data: ActualizarAnuncioRequest) => {
      await updateAnuncioMut.mutateAsync({ id, data });
    },
    [updateAnuncioMut]
  );

  const regionesAnuncio = useMemo(() => {
    const fromAnuncios = anuncios.map((a) => a.region).filter(Boolean) as string[];
    const fromEmergencias = emergencias.map((e) => e.region);
    return Array.from(new Set([...fromAnuncios, ...fromEmergencias])).sort();
  }, [anuncios, emergencias]);

  const handleCrearEmergencia = useCallback(
    async (data: {
      tipo: TipoEmergencia;
      severidad: NivelSeveridad;
      region: string;
      estado: EstadoEmergencia;
    }) => {
      if (!poligonoBorrador?.length) {
        throw new Error('Dibuja la zona en el mapa con la herramienta "Dibujar zona".');
      }
      const puntos = poligonoBorrador.map((p) => ({ longitud: p.lng, latitud: p.lat }));
      const preparada = prepararZonaImpactoParaApi(puntos);
      if (!preparada) {
        throw new Error(
          `El polígono debe tener al menos ${MIN_VERTICES_ZONA_IMPACTO} vértices (4 coordenadas cerradas). ` +
            "Haz más clics en el mapa antes de guardar."
        );
      }

      const centrosValidos = centrosBorrador.filter((c) => c.nombre.trim());
      const centrosAcopio: SolicitudCentroAcopioRequest[] | undefined = centrosValidos.length
        ? centrosValidos.map((c) => ({
            nombre: c.nombre.trim(),
            ubicacion: { longitud: c.lng, latitud: c.lat },
            capacidadEstimada: c.capacidad ? Number(c.capacidad) : undefined,
          }))
        : undefined;

      const payload: CrearEmergenciaRequest = {
        tipo: mapTipoUiABackend(data.tipo),
        severidad: severidadUiAApi(data.severidad),
        region: data.region.trim(),
        epicentro: preparada.epicentro,
        zonaImpacto: preparada.ring,
        ...(centrosAcopio ? { centrosAcopio } : {}),
      };

      const creada = await createMutation.mutateAsync(payload);

      if (data.estado !== "ACTIVA") {
        await updateMutation.mutateAsync({
          id: creada.id,
          data: { nuevoEstado: data.estado },
        });
      }

      const habiaCentros = Boolean(centrosAcopio?.length);
      setPoligonoBorrador(null);
      setCentrosBorrador([]);
      setColocandoCentro(false);
      setHerramientaMapa("Dibujar zona");
      setEmergenciaSeleccionada(creada);
      setPanelVista("detalles");
      void refetchGeoJson();

      // Los centros llegan de forma asíncrona vía RabbitMQ (emergency.created → ms-resources).
      // Refrescamos varias veces para reflejarlos cuando aparezcan.
      if (habiaCentros) {
        [1500, 4000, 8000].forEach((ms) =>
          setTimeout(() => {
            void refetchCentros();
            void refetchCentrosDetalle();
          }, ms)
        );
      }
    },
    [poligonoBorrador, centrosBorrador, createMutation, updateMutation, refetchGeoJson, refetchCentros, refetchCentrosDetalle]
  );


  const handleUpdateEstado = useCallback(
    async (estado: EstadoEmergencia) => {
      if (!emergenciaSeleccionada) return;
      await updateMutation.mutateAsync({
        id: emergenciaSeleccionada.id,
        data: { nuevoEstado: estado },
      });
    },
    [emergenciaSeleccionada, updateMutation]
  );

  const handleDeleteEmergencia = useCallback(async () => {
    if (!emergenciaSeleccionada) return;
    if (
      !confirm(
        `¿Finalizar la emergencia "${emergenciaSeleccionada.titulo ?? emergenciaSeleccionada.tipo}"? ` +
          "Se marcará como FINALIZADA en el sistema (no hay borrado físico en la API)."
      )
    )
      return;
    await deleteMutation.mutateAsync(emergenciaSeleccionada.id);
    setEmergenciaSeleccionada(null);
    setPanelVista("detalles");
  }, [emergenciaSeleccionada, deleteMutation]);

  const handleCrearCentro = useCallback(
    async (data: {
      nombre: string;
      direccion: string;
      ciudad: string;
      region: string;
      latitud?: number;
      longitud?: number;
      capacidad?: string;
    }) => {
      if (
        data.latitud == null ||
        data.longitud == null ||
        Number.isNaN(data.latitud) ||
        Number.isNaN(data.longitud)
      ) {
        throw new Error(
          "Ingresa coordenadas válidas (latitud y longitud) para ubicar el centro."
        );
      }
      const capacidad = data.capacidad ? Number(data.capacidad) : undefined;
      await crearCentroMut.mutateAsync({
        nombre: data.nombre.trim(),
        direccion: data.direccion.trim() || undefined,
        coordenadas: { longitud: data.longitud, latitud: data.latitud },
        region: data.region.trim() || undefined,
        comuna: data.ciudad.trim() || undefined,
        capacidad: capacidad && capacidad > 0 ? capacidad : undefined,
      });
      void refetchCentros();
      void refetchCentrosDetalle();
      setPanelVista("centros");
    },
    [crearCentroMut, refetchCentros, refetchCentrosDetalle]
  );

  // ── Render states ──
  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState />
      </div>
    );
  }

  const mostrarBannerErrorEmergencias = Boolean(error) && !ocultarBannerEmergencias;

  return (
    <>
        {mostrarBannerErrorEmergencias && (
          <div className={`api-error-banner ${theme}`} role="alert">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <AlertCircle size={18} style={{ color: "#ef4444", flexShrink: 0, marginTop: 2 }} />
              <div className="api-error-banner__text">
                <strong>Error al cargar emergencias</strong>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                  {(error as Error)?.message ?? "El servicio de emergencias no responde."}
                </div>
              </div>
            </div>
            <div className="api-error-banner__actions">
              <button
                type="button"
                className="btn-guardar"
                onClick={() => {
                  setOcultarBannerEmergencias(false);
                  void refetch();
                  void refetchGeoJson();
                }}
              >
                Reintentar
              </button>
              <button
                type="button"
                className="btn-panel-cancelar"
                onClick={() => setOcultarBannerEmergencias(true)}
              >
                Ocultar aviso
              </button>
            </div>
          </div>
        )}

        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <h1 className="header-title">EMERGENCIAS EN TIEMPO REAL</h1>
            <p className="header-subtitle">Monitoreo y gestión de catástrofes activas en Chile</p>
          </div>
          <div className="header-controls">
            <select className="header-select" value={filtroRegion} onChange={(e) => setFiltroRegion(e.target.value)}>
              <option>Todas las regiones</option>
              {regiones.map((r) => <option key={r}>{r}</option>)}
            </select>
            <select className="header-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option>Todos los tipos</option>
              {tipos.map((t) => <option key={t}>{t}</option>)}
            </select>
            
            <button className="btn-nueva-emergencia" onClick={iniciarCreacionNuevaEmergencia}>
              <span>+</span><span>Nueva emergencia</span>
            </button>
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* CUERPO */}
        <div className="dashboard-body">

          {/* LISTA EMERGENCIAS */}
          <div className="emergencias-list">
            <div className="emergencias-scroll">
              <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                <h2 className="section-label">
                  Emergencias Activas
                  <span className="count-badge">{emergenciasFiltradas.length}</span>
                </h2>
              </div>

              {emergenciasFiltradas.length === 0 && (
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", padding: "16px 0" }}>
                  No hay emergencias con los filtros seleccionados.
                </p>
              )}

              {emergenciasFiltradas.map((em) => {
                const activa = !enModoCrearEmergencia && emergenciaSeleccionada?.id === em.id;
                return (
                  <div
                    key={em.id}
                    className={`emergencia-card${activa ? " selected" : ""}${enModoCrearEmergencia ? "" : " emergencia-card--clickable"}`}
                    role="button"
                    tabIndex={enModoCrearEmergencia ? -1 : 0}
                    onClick={
                      enModoCrearEmergencia
                        ? undefined
                        : () => seleccionarEmergencia(em, "detalles")
                    }
                    onKeyDown={
                      enModoCrearEmergencia
                        ? undefined
                        : (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              seleccionarEmergencia(em, "detalles");
                            }
                          }
                    }
                  >
                    <div className="emergencia-card-header">
                      <div className="flex items-center gap-2">
                        <div className={`emergencia-icon-wrap ${nivelIconoBgClass[em.severidad] ?? "icon-media"}`}>
                          {iconosPorTipo[em.tipo] ?? <AlertTriangle size={16} />}
                        </div>
                        <span className="emergencia-tipo">{em.tipo}</span>
                      </div>
                      <span className={nivelBadgeClass[em.severidad] ?? "nivel-badge nivel-media"}>{em.severidad}</span>
                    </div>
                    <p className="emergencia-region">{em.region}</p>
                    <p className="emergencia-comunas">{em.comunas ?? em.comuna ?? ""}</p>
                    {(em.iniciada ?? em.createdAt) && (
                      <div className="emergencia-fecha">
                        <Clock size={12} />
                        <span>Iniciada: {em.iniciada ?? new Date(em.createdAt!).toLocaleString("es-CL")}</span>
                      </div>
                    )}
                    <div className="emergencia-actions">
                      <button
                        type="button"
                        className="card-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          seleccionarEmergencia(em, "detalles");
                        }}
                      >
                        <ClipboardList size={12} /> Detalles
                      </button>
                      <button
                        type="button"
                        className="card-action-btn card-action-btn--edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirCrearEmergencia(em);
                        }}
                      >
                        <Edit3 size={12} /> Editar
                      </button>
                    </div>
                  </div>
                );
              })}

              <button className="link-ver-todas">Ver todas las emergencias →</button>
            </div>
          </div>

          {/* MAPA */}
          <div className="mapa-container">
            <EmergencyMapGoogle
              apiKey={googleMapsApiKey}
              defaultMapDark={dark}
              emergencias={emergenciasFiltradas}
              geoJson={geoJson}
              herramientaZona={herramientaMapa}
              poligonoBorrador={poligonoBorrador}
              onPoligonoBorradorChange={setPoligonoBorrador}
              selectedId={mapSelectedId}
              onSelectEmergenciaId={onSelectEmergenciaId}
              seleccionEnMapaHabilitada={!enModoCrearEmergencia}
              modoColocarCentro={enModoCrearEmergencia && colocandoCentro}
              centrosBorrador={centrosBorrador.map((c) => ({
                id: c.id,
                nombre: c.nombre,
                lat: c.lat,
                lng: c.lng,
              }))}
              onAgregarCentroBorrador={agregarCentroBorrador}
              onMoverCentroBorrador={moverCentroBorrador}
              centrosPersistidos={centrosParaMapa}
              centroSeleccionadoId={centroSeleccionadoId}
              onSelectCentro={setCentroSeleccionadoId}
              onCerrarCentro={() => setCentroSeleccionadoId(null)}
            />

            <div className="mapa-zoom-controls">
              <button type="button" className="mapa-zoom-btn" aria-label="Acercar (usa rueda del mouse)">+</button>
              <div className="mapa-divider" />
              <button type="button" className="mapa-zoom-btn" aria-label="Alejar">−</button>
            </div>

            <div className="mapa-zone-tools">
              {(
                [
                  { label: "Dibujar zona" as const, icon: <Square size={14} /> },
                  { label: "Editar zona" as const, icon: <Pencil size={14} /> },
                  { label: "Borrar zona" as const, icon: <Trash2 size={14} /> },
                ] as const
              ).map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  className={`zone-tool-btn${herramientaMapa === btn.label ? " active" : ""}`}
                  onClick={() => setHerramientaMapa(btn.label)}
                >
                  {btn.icon}
                  <span style={{ marginLeft: 4 }}>{btn.label}</span>
                </button>
              ))}
            </div>

            <div className="mapa-leyenda">
              <div className="leyenda-header">
                <FolderKanban size={14} />
                <span>Leyenda</span>
              </div>
              {(["ALTA", "MEDIA", "BAJA"] as NivelAlerta[]).map((n) => (
                <div key={n} className="leyenda-item">
                  <div className={`leyenda-dot dot-${n.toLowerCase()}`} />
                  <span>{n.charAt(0) + n.slice(1).toLowerCase()}</span>
                </div>
              ))}
              {centrosApiHabilitada && (
                <div className="leyenda-item">
                  <div className="leyenda-dot" style={{ background: "#0d9488" }} />
                  <span>Centro de acopio</span>
                </div>
              )}
            </div>
          </div>

          {/* PANEL DERECHO */}
          <PanelDerecho
            theme={theme}
            vista={panelVista}
            setVista={setPanelVista}
            emergencia={emergenciaSeleccionada}
            centrosApiHabilitada={centrosApiHabilitada}
            centrosDetalle={centrosDetalle}
            centrosDeEmergencia={centrosDeEmergencia}
            resolverEtiquetaEmergencia={resolverEtiquetaEmergencia}
            onSeleccionarCentro={setCentroSeleccionadoId}
            centroSeleccionadoId={centroSeleccionadoId}
            centrosCargando={centrosCargando}
            anuncios={anuncios}
            anunciosCargando={anunciosCargando}
            regionesAnuncio={regionesAnuncio}
            onActualizarAnuncio={handleActualizarAnuncio}
            actualizandoAnuncioId={
              updateAnuncioMut.isPending && updateAnuncioMut.variables
                ? updateAnuncioMut.variables.id
                : null
            }
            onEditarEmergencia={() => abrirCrearEmergencia(emergenciaSeleccionada ?? undefined)}
            onIniciarCreacionNuevaEmergencia={iniciarCreacionNuevaEmergencia}
            onUpdateEstado={handleUpdateEstado}
            onDeleteEmergencia={handleDeleteEmergencia}
            onCrearEmergencia={handleCrearEmergencia}
            onCrearCentro={handleCrearCentro}
            editData={editData}
            isCreating={createMutation.isPending}
            isUpdating={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
            herramientaMapa={herramientaMapa}
            setHerramientaMapa={setHerramientaMapa}
            epicentroPreview={epicentroPreview}
            cantidadVerticesZona={poligonoBorrador?.length ?? 0}
            colocandoCentro={colocandoCentro}
            onToggleColocarCentro={() => setColocandoCentro((v) => !v)}
            centrosBorrador={centrosBorrador}
            onActualizarCentroBorrador={actualizarCentroBorrador}
            onEliminarCentroBorrador={eliminarCentroBorrador}
          />
        </div>

        {/* KPIs BARRA INFERIOR */}
        <div className="kpis-bar">
          {[
            { icono: <TrendingUp size={18} />, valor: String(kpis.totalActivas),                                  etiqueta: "Emergencias activas",           colorClass: "kpi-emergencias" },
            { icono: <AlertTriangle size={18}/>,valor: String(kpis.totalCriticas),                                etiqueta: "Emergencias críticas",          colorClass: "kpi-emergencias" },
            ...(centrosApiHabilitada
              ? [{ icono: <Home size={18} />, valor: String(centros.filter((c) => c.estado === "Abierto").length), etiqueta: "Centros de acopio operativos", colorClass: "" }]
              : []),
            { icono: <MapPin size={18} />,      valor: String(kpis.regionesMasAfectadas.length),                  etiqueta: "Regiones afectadas",            colorClass: "" },
          ].map((kpi) => (
            <div key={kpi.etiqueta} className="kpi-item">
              <span className="kpi-emoji">{kpi.icono}</span>
              <div>
                <p className={`kpi-valor ${kpi.colorClass}`}>{kpi.valor}</p>
                <p className="kpi-label">{kpi.etiqueta}</p>
              </div>
            </div>
          ))}
        </div>
        </div>

      
    </>
  );
}

