"use client";

/**
 * PaginaEmergencias.tsx
 * Dashboard principal — consume API real a través de useEmergencies hooks
 * + Panel de análisis IA con Anthropic API (claude-sonnet-4-20250514)
 */

import { useState, useCallback, useRef, useEffect } from "react";
import GoogleMapReact from "google-map-react";
import "@/styles/emergency.css";
import Sidebar from "@/components/sidebar";
import {
  useEmergenciasActivas,
  useCreateEmergencia,
  useUpdateEstadoEmergencia,
  useDeleteEmergencia,
  useEmergenciasKpis,
  useCentrosAcopio,
  useCreateCentroAcopio,
} from "@/hooks/useEmergencies";
import type {
  Emergencia,
  CentroAcopio,
  NivelAlerta,
  EstadoEmergencia,
  TipoEmergencia,
  NivelSeveridad,
} from "@/services/emergency.service";
import {
  Flame, Waves, Home, Zap, Mountain, CloudRain,
  Square, Pencil, Trash2, ClipboardList, AlertTriangle,
  Warehouse, Clock, MapPin, Edit3, Bell, FolderKanban,
  TrendingUp, Users, Truck, Plane, Moon, Sun,
  RefreshCw, AlertCircle, Brain, Send, Loader2, X,
} from "lucide-react";

// ─── Helpers UI ───────────────────────────────────────────────────────────────

const iconosPorTipo: Record<string, React.ReactNode> = {
  "Incendios Forestales": <Flame size={16} />,
  INCENDIO:               <Flame size={16} />,
  "Alerta de Tsunami":    <Waves size={16} />,
  Inundaciones:           <CloudRain size={16} />,
  Terremoto:              <Zap size={16} />,
  SISMO:                  <Zap size={16} />,
  "Erupción Volcánica":   <Mountain size={16} />,
  Aluvión:                <Mountain size={16} />,
  ALUVION:                <Mountain size={16} />,
  INFRAESTRUCTURA:        <Home size={16} />,
  MAREJADA:               <Waves size={16} />,
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

const estadoPillClass: Record<string, string> = {
  Abierto:        "estado-pill estado-abierto",
  "En evaluación":"estado-pill estado-evaluacion",
  Cerrado:        "estado-pill estado-cerrado",
};

const markerColor: Record<string, string> = {
  ALTA: "#ef4444", MEDIA: "#f97316", BAJA: "#22c55e",
  CRITICA: "#ef4444",
};

/** Convierte severidad (CRITICA/ALTA/MEDIA/BAJA) a NivelAlerta (ALTA/MEDIA/BAJA) */
const severidadANivel = (sev: string): NivelAlerta => {
  if (sev === "CRITICA" || sev === "ALTA") return "ALTA";
  if (sev === "BAJA") return "BAJA";
  return "MEDIA";
};

// ─── Marker Mapa ──────────────────────────────────────────────────────────────

function MarkerMapa({
  nivel, tipo,
}: {
  nivel: string; lat: number; lng: number; tipo: string;
}) {
  const color = markerColor[nivel] ?? "#f97316";
  return (
    <div className="map-marker">
      <div
        className="map-marker-inner"
        style={{ backgroundColor: color, boxShadow: `0 0 14px ${color}80` }}
      >
        <span style={{ fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {iconosPorTipo[tipo] ?? <AlertTriangle size={14} />}
        </span>
      </div>
      <div className="map-marker-ping" style={{ backgroundColor: color }} />
    </div>
  );
}

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
        `• ${e.titulo ?? e.tipo} | Tipo: ${e.tipo} | Severidad: ${e.severidad} | Estado: ${e.estado} | Región: ${e.region} | Afectados: ${e.afectados ?? e.personasAfectadas ?? 0}`
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

  return (
    <div className="panel-ia-overlay">
      <div className="panel-ia">
        <div className="panel-ia-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Brain size={18} />
            <span>Análisis IA — Claude</span>
          </div>
          <button onClick={onClose} className="panel-ia-close">
            <X size={16} />
          </button>
        </div>

        <div className="panel-ia-mensajes">
          {mensajes.map((m, i) => (
            <div key={i} className={`ia-mensaje ia-mensaje--${m.role}`}>
              <div className="ia-avatar">
                {m.role === "assistant" ? <Brain size={12} /> : <Users size={12} />}
              </div>
              <div className="ia-burbuja">{m.content}</div>
            </div>
          ))}
          {cargando && (
            <div className="ia-mensaje ia-mensaje--assistant">
              <div className="ia-avatar"><Brain size={12} /></div>
              <div className="ia-burbuja ia-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="panel-ia-accesos">
          {accesosRapidos.map((q) => (
            <button key={q} className="ia-acceso-btn" onClick={() => enviar(q)}>
              {q}
            </button>
          ))}
        </div>

        <div className="panel-ia-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar(input)}
            placeholder="Pregunta sobre las emergencias..."
            disabled={cargando}
          />
          <button onClick={() => enviar(input)} disabled={cargando || !input.trim()}>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Panel Derecho con Tabs ───────────────────────────────────────────────────

type VistaPanel = "detalles" | "crear-emergencia" | "centros" | "crear-centro";

function PanelDerecho({
  theme,
  vista,
  setVista,
  emergencia,
  centros,
  centrosCargando,
  onEditarEmergencia,
  onUpdateEstado,
  onDeleteEmergencia,
  onCrearEmergencia,
  onCrearCentro,
  editData,
  isCreating,
  isUpdating,
  isDeleting,
}: {
  theme: string;
  vista: VistaPanel;
  setVista: (v: VistaPanel) => void;
  emergencia: Emergencia | null;
  centros: CentroAcopio[];
  centrosCargando: boolean;
  onEditarEmergencia: () => void;
  onUpdateEstado: (estado: EstadoEmergencia) => void;
  onDeleteEmergencia: () => void;
  onCrearEmergencia: (data: {
    titulo: string; tipo: TipoEmergencia; severidad: NivelSeveridad;
    descripcion: string; region: string; comuna: string;
    latitud: number; longitud: number; afectados: number;
  }) => void;
  onCrearCentro: (data: {
    nombre: string; direccion: string; ciudad: string;
    region: string; latitud?: number; longitud?: number; capacidad?: string;
  }) => void;
  editData?: { tipo: string; nivel: string; nombre: string };
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}) {
  const [formEmergencia, setFormEmergencia] = useState({
    titulo: editData?.nombre ?? "",
    tipo: (editData?.tipo ?? "Incendios Forestales") as TipoEmergencia,
    severidad: "ALTA" as NivelSeveridad,
    descripcion: "",
    region: "",
    comuna: "",
    latitud: -33.45,
    longitud: -70.67,
    afectados: 0,
  });

  const [formCentro, setFormCentro] = useState({
    nombre: "", direccion: "", ciudad: "", region: "",
    latitud: "", longitud: "", capacidad: "",
  });

  const [zonaActiva, setZonaActiva] = useState("Dibujar zona");

  const herramientasZona = [
    { id: "Dibujar zona", icono: <Square size={18} />, label: "Dibujar zona" },
    { id: "Editar zona",  icono: <Pencil size={18} />, label: "Editar zona" },
    { id: "Borrar zona",  icono: <Trash2 size={18} />, label: "Borrar zona" },
  ];

  const handleCrearEmergencia = () => {
    if (!formEmergencia.titulo.trim()) return;
    onCrearEmergencia({
      ...formEmergencia,
      latitud: Number(formEmergencia.latitud),
      longitud: Number(formEmergencia.longitud),
      afectados: Number(formEmergencia.afectados),
    });
  };

  const handleCrearCentro = () => {
    if (!formCentro.nombre.trim()) return;
    onCrearCentro({
      nombre: formCentro.nombre,
      direccion: formCentro.direccion,
      ciudad: formCentro.ciudad,
      region: formCentro.region,
      latitud: formCentro.latitud ? Number(formCentro.latitud) : undefined,
      longitud: formCentro.longitud ? Number(formCentro.longitud) : undefined,
      capacidad: formCentro.capacidad || undefined,
    });
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
          onClick={() => { setFormEmergencia({ titulo:"", tipo:"Incendios Forestales", severidad:"ALTA", descripcion:"", region:"", comuna:"", latitud:-33.45, longitud:-70.67, afectados:0 }); setVista("crear-emergencia"); }}
        >
          <AlertTriangle size={14} className="mr-1" /> Crear Emergencia
        </button>
        <button
          className={`panel-tab${(vista === "centros" || vista === "crear-centro") ? " panel-tab--active" : ""}`}
          onClick={() => setVista("centros")}
        >
          <Warehouse size={14} className="mr-1" /> Centros
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
                    <p className="detalle-nombre">{emergencia.titulo ?? emergencia.tipo}</p>
                    <p className="detalle-region">{emergencia.region}</p>
                  </div>
                </div>
                <span className={nivelBadgeClass[emergencia.severidad] ?? "nivel-badge"}>
                  {emergencia.severidad}
                </span>
              </div>

              {(emergencia.iniciada ?? emergencia.createdAt) && (
                <div className="emergencia-fecha" style={{ marginBottom: 8 }}>
                  <Clock size={14} />
                  <span>Iniciada: {emergencia.iniciada ?? new Date(emergencia.createdAt!).toLocaleString("es-CL")}</span>
                </div>
              )}

              <p className="detalle-desc">{emergencia.descripcion}</p>

              <div className="detalle-kpis">
                <div className="kpi-cell">
                  <p className="kpi-valor">
                    {(emergencia.afectados ?? emergencia.personasAfectadas ?? 0).toLocaleString("es-CL")}
                  </p>
                  <p className="kpi-label">Personas afectadas</p>
                </div>
                {emergencia.comunasAfectadas && (
                  <div className="kpi-cell">
                    <p className="kpi-valor">{emergencia.comunasAfectadas}</p>
                    <p className="kpi-label">Comunas afectadas</p>
                  </div>
                )}
                {emergencia.hectareasQuemadas && (
                  <div className="kpi-cell">
                    <p className="kpi-valor">{emergencia.hectareasQuemadas.toLocaleString("es-CL")}</p>
                    <p className="kpi-label">Hectáreas quemadas</p>
                  </div>
                )}
              </div>

              {/* Cambiar estado rápido */}
              <div style={{ margin: "10px 0 6px" }}>
                <label className="panel-form-label">Cambiar estado</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                  {(["ACTIVA", "EN_PROCESO", "RESUELTA", "CERRADA"] as EstadoEmergencia[]).map((est) => (
                    <button
                      key={est}
                      className={`btn-informe${emergencia.estado === est ? " btn-estado-activo" : ""}`}
                      style={{ fontSize: 10, padding: "4px 8px", flex: "0 0 auto" }}
                      onClick={() => onUpdateEstado(est)}
                      disabled={isUpdating || emergencia.estado === est}
                    >
                      {est.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2" style={{ marginTop: 8 }}>
                <button className="btn-informe" style={{ flex: 1 }} onClick={onEditarEmergencia}>
                  <Edit3 size={12} style={{ marginRight: 4 }} /> EDITAR
                </button>
                <button
                  className="btn-guardar"
                  style={{ flex: 1, fontSize: 10, background: "#ef4444", border: "none" }}
                  onClick={onDeleteEmergencia}
                  disabled={isDeleting}
                >
                  <Trash2 size={12} style={{ marginRight: 4 }} />
                  {isDeleting ? "Eliminando..." : "ELIMINAR"}
                </button>
              </div>
            </div>

            {/* Centros cercanos */}
            <div style={{ marginTop: 20 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <h3 className="panel-section-title" style={{ margin: 0 }}>Centros de Acopio Cercanos</h3>
                <button className="btn-nueva-emergencia" style={{ fontSize: 10, padding: "4px 10px" }} onClick={() => setVista("crear-centro")}>
                  + Nuevo
                </button>
              </div>
              {centrosCargando ? (
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Cargando centros...</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {centros.slice(0, 3).map((c) => (
                    <button key={c.id} className="centro-row">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <div>
                          <p className="centro-nombre">{c.nombre}</p>
                          <p className="centro-ciudad">{c.ciudad}, {c.region}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {c.distanciaKm && <span className="centro-distancia">{c.distanciaKm} km</span>}
                        <span className={estadoPillClass[c.estado] ?? "estado-pill"}>{c.estado}</span>
                      </div>
                    </button>
                  ))}
                  {centros.length === 0 && (
                    <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>No hay centros registrados.</p>
                  )}
                </div>
              )}
            </div>
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
                  className={`zona-tool-btn${zonaActiva === h.id ? " zona-tool-btn--active" : ""}`}
                  onClick={() => setZonaActiva(h.id)}
                >
                  <span className="zona-tool-icon">{h.icono}</span>
                  <span className="zona-tool-label">{h.label}</span>
                </button>
              ))}
            </div>

            <div className="panel-lateral-body" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="panel-form-label">Título *</label>
                <input
                  type="text"
                  className="panel-form-input"
                  placeholder="Ej: Incendio Forestal Quilpué"
                  value={formEmergencia.titulo}
                  onChange={(e) => setFormEmergencia({ ...formEmergencia, titulo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="panel-form-label">Tipo de emergencia</label>
                <div className="panel-form-select-wrap">
                  <span className="panel-form-icon">{iconosPorTipo[formEmergencia.tipo]}</span>
                  <select
                    className="panel-form-select"
                    value={formEmergencia.tipo}
                    onChange={(e) => setFormEmergencia({ ...formEmergencia, tipo: e.target.value as TipoEmergencia })}
                  >
                    {["Incendios Forestales","Alerta de Tsunami","Inundaciones","Terremoto","Erupción Volcánica","Aluvión","INCENDIO","SISMO","ALUVION","INFRAESTRUCTURA","MAREJADA"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="panel-form-label">Severidad</label>
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

              <div style={{ display: "flex", gap: 10 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="panel-form-label">Región *</label>
                  <input
                    type="text"
                    className="panel-form-input"
                    placeholder="Ej: Valparaíso"
                    value={formEmergencia.region}
                    onChange={(e) => setFormEmergencia({ ...formEmergencia, region: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="panel-form-label">Comuna</label>
                  <input
                    type="text"
                    className="panel-form-input"
                    placeholder="Ej: Quilpué"
                    value={formEmergencia.comuna}
                    onChange={(e) => setFormEmergencia({ ...formEmergencia, comuna: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="panel-form-label">Latitud</label>
                  <input
                    type="number"
                    className="panel-form-input"
                    placeholder="-33.45"
                    value={formEmergencia.latitud}
                    onChange={(e) => setFormEmergencia({ ...formEmergencia, latitud: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="panel-form-label">Longitud</label>
                  <input
                    type="number"
                    className="panel-form-input"
                    placeholder="-70.67"
                    value={formEmergencia.longitud}
                    onChange={(e) => setFormEmergencia({ ...formEmergencia, longitud: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="panel-form-label">Afectados estimados</label>
                <input
                  type="number"
                  className="panel-form-input"
                  placeholder="0"
                  min={0}
                  value={formEmergencia.afectados}
                  onChange={(e) => setFormEmergencia({ ...formEmergencia, afectados: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="panel-form-label">Descripción</label>
                <textarea
                  className="panel-form-input"
                  rows={3}
                  placeholder="Descripción detallada de la emergencia..."
                  value={formEmergencia.descripcion}
                  onChange={(e) => setFormEmergencia({ ...formEmergencia, descripcion: e.target.value })}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>

            <div className="panel-lateral-actions" style={{ marginTop: "auto", paddingTop: 16 }}>
              <button className="btn-panel-cancelar" onClick={() => setVista("detalles")}>Cancelar</button>
              <button className="btn-panel-guardar" onClick={handleCrearEmergencia} disabled={isCreating}>
                {isCreating ? <><Loader2 size={12} className="animate-spin" style={{ marginRight: 4 }} /> Guardando...</> : "Guardar emergencia"}
              </button>
            </div>
          </div>
        )}

        {/* ── LISTA CENTROS ── */}
        {vista === "centros" && (
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
                {centros.map((c) => (
                  <button key={c.id} className="centro-row">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <div>
                        <p className="centro-nombre">{c.nombre}</p>
                        <p className="centro-ciudad">{c.ciudad}, {c.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {c.distanciaKm && <span className="centro-distancia">{c.distanciaKm} km</span>}
                      <span className={estadoPillClass[c.estado] ?? "estado-pill"}>{c.estado}</span>
                    </div>
                  </button>
                ))}
                {centros.length === 0 && (
                  <p style={{ fontSize: 12, color: "var(--color-text-secondary)", textAlign: "center", padding: 24 }}>
                    No hay centros de acopio registrados.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CREAR CENTRO ── */}
        {vista === "crear-centro" && (
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
                <label className="panel-form-label">Coordenadas</label>
                <div className="coords-wrap">
                  <input type="text" className="form-input" placeholder="-33.0389" value={formCentro.latitud} onChange={(e) => setFormCentro({ ...formCentro, latitud: e.target.value })} />
                  <span className="coords-sep">:</span>
                  <input type="text" className="form-input" placeholder="-71.4378" value={formCentro.longitud} onChange={(e) => setFormCentro({ ...formCentro, longitud: e.target.value })} />
                  <button className="coords-pin-btn"><MapPin size={16} /></button>
                </div>
              </div>
              <div className="form-group">
                <label className="panel-form-label">Capacidad estimada</label>
                <select className="form-select" value={formCentro.capacidad} onChange={(e) => setFormCentro({ ...formCentro, capacidad: e.target.value })}>
                  <option value="">Seleccionar</option>
                  <option>Pequeño (1-50)</option>
                  <option>Mediano (51-200)</option>
                  <option>Grande (200+)</option>
                </select>
              </div>
            </div>

            <div className="panel-lateral-actions" style={{ marginTop: "auto", paddingTop: 16 }}>
              <button className="btn-panel-cancelar" onClick={() => setVista("centros")}>Cancelar</button>
              <button className="btn-panel-guardar" onClick={handleCrearCentro}>Crear centro</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PaginaEmergencias() {
  const [dark, setDark] = useState(true);
  const [emergenciaSeleccionada, setEmergenciaSeleccionada] = useState<Emergencia | null>(null);
  const [panelVista, setPanelVista] = useState<VistaPanel>("detalles");
  const [editData, setEditData] = useState<{ tipo: string; nivel: string; nombre: string } | undefined>();
  const [filtroRegion, setFiltroRegion] = useState("Todas las regiones");
  const [filtroTipo, setFiltroTipo] = useState("Todos los tipos");
  const [zonaActiva, setZonaActiva] = useState("Dibujar zona");
  const [mostrarIA, setMostrarIA] = useState(false);

  const theme = dark ? "dark" : "light";

  // ── Queries ──
  const {
    data: emergencias = [],
    isLoading,
    error,
    refetch,
  } = useEmergenciasActivas();

  const { data: centros = [], isLoading: centrosCargando } = useCentrosAcopio();

  const kpis = useEmergenciasKpis(emergencias);

  // ── Mutations ──
  const createMutation    = useCreateEmergencia();
  const updateMutation    = useUpdateEstadoEmergencia();
  const deleteMutation    = useDeleteEmergencia();
  const createCentroMut   = useCreateCentroAcopio();

  // ── Filtros aplicados ──
  const emergenciasFiltradas = emergencias.filter((e) => {
    const regionOk = filtroRegion === "Todas las regiones" || e.region === filtroRegion;
    const tipoOk   = filtroTipo   === "Todos los tipos"   || e.tipo === filtroTipo;
    return regionOk && tipoOk;
  });

  const regiones = Array.from(new Set(emergencias.map((e) => e.region)));
  const tipos    = Array.from(new Set(emergencias.map((e) => e.tipo)));

  // ── Handlers ──
  const abrirCrearEmergencia = useCallback((em?: Emergencia) => {
    if (em) {
      setEditData({
        tipo: em.tipo,
        nivel: em.severidad,
        nombre: em.titulo ?? em.tipo,
      });
    } else {
      setEditData(undefined);
    }
    setPanelVista("crear-emergencia");
  }, []);

  const handleCrearEmergencia = useCallback(
    async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
      await createMutation.mutateAsync(data);
      setPanelVista("detalles");
    },
    [createMutation]
  );

  const handleUpdateEstado = useCallback(
    async (estado: EstadoEmergencia) => {
      if (!emergenciaSeleccionada) return;
      await updateMutation.mutateAsync({ id: emergenciaSeleccionada.id, data: { estado } });
    },
    [emergenciaSeleccionada, updateMutation]
  );

  const handleDeleteEmergencia = useCallback(async () => {
    if (!emergenciaSeleccionada) return;
    if (!confirm(`¿Eliminar "${emergenciaSeleccionada.titulo ?? emergenciaSeleccionada.tipo}"?`)) return;
    await deleteMutation.mutateAsync(emergenciaSeleccionada.id);
    setEmergenciaSeleccionada(null);
    setPanelVista("detalles");
  }, [emergenciaSeleccionada, deleteMutation]);

  const handleCrearCentro = useCallback(
    async (data: Parameters<typeof createCentroMut.mutateAsync>[0]) => {
      await createCentroMut.mutateAsync(data);
      setPanelVista("centros");
    },
    [createCentroMut]
  );

  // ── Render states ──
  if (isLoading) return <LoadingState />;

  const hasError = Boolean(error);

  return (
    <div className={`dashboard-root ${theme}`}>
      {/* SIDEBAR */}
      <Sidebar dark={dark} setDark={setDark} />

      {/* Error banner no bloqueante: muestra mensaje y permite reintento, pero sigue renderizando UI */}
      {hasError && (
        <div className="api-error-banner" style={{ position: 'fixed', top: 80, left: 24, right: 24, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245, 101, 101, 0.12)', border: '1px solid rgba(245, 101, 101, 0.2)', padding: '10px 14px', borderRadius: 8 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <AlertCircle size={18} style={{ color: '#ef4444' }} />
            <div>
              <strong>Error al cargar emergencias</strong>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{(error as any)?.message ?? 'El servicio de emergencias no responde.'}</div>
            </div>
          </div>
          <div>
            <button onClick={() => refetch()} className="btn-guardar" style={{ marginRight: 8 }}>Reintentar</button>
            <button onClick={() => setMostrarIA(false)} className="btn-panel-cancelar">Cerrar</button>
          </div>
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

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
            <button
              className="header-bell"
              onClick={() => setMostrarIA((v) => !v)}
              title="Análisis IA"
              style={{ position: "relative" }}
            >
              <Brain size={18} />
              <span className="bell-badge" style={{ background: "#3b82f6" }}>IA</span>
            </button>
            <button className="header-bell" title="Actualizar" onClick={() => refetch()}>
              <RefreshCw size={18} />
            </button>
            <button className="header-bell">
              <Bell size={18} />
              <span className="bell-badge">{emergenciasFiltradas.length}</span>
            </button>
            <button className="btn-nueva-emergencia" onClick={() => { setEditData(undefined); setPanelVista("crear-emergencia"); }}>
              <span>+</span><span>Nueva emergencia</span>
            </button>
          </div>
        </header>

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
                const activa = emergenciaSeleccionada?.id === em.id;
                const nivel = severidadANivel(em.severidad);
                return (
                  <div key={em.id} className={`emergencia-card${activa ? " selected" : ""}`}>
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
                      <button className="card-action-btn" onClick={() => { setEmergenciaSeleccionada(em); setPanelVista("detalles"); }}>
                        <ClipboardList size={12} className="mr-1" /> Detalles
                      </button>
                      <button className="card-action-btn card-action-btn--edit" onClick={() => abrirCrearEmergencia(em)}>
                        <Edit3 size={12} className="mr-1" /> Editar
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
            <GoogleMapReact
              bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "" }}
              defaultCenter={{ lat: -35.5, lng: -71.0 }}
              defaultZoom={5}
              options={{
                styles: dark
                  ? [
                      { elementType: "geometry",             stylers: [{ color: "#1a1a14" }] },
                      { elementType: "labels.text.fill",     stylers: [{ color: "#7a7a6a" }] },
                      { elementType: "labels.text.stroke",   stylers: [{ color: "#1a1a14" }] },
                      { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a0f1a" }] },
                      { featureType: "road",  elementType: "geometry", stylers: [{ color: "#2a2a1e" }] },
                      { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#3a3a2a" }] },
                    ]
                  : [],
                disableDefaultUI: true,
                zoomControl: false,
              }}
              onClick={({ lat, lng }) => {
                // Al hacer clic en el mapa, pre-rellenar coords en el formulario
                setEditData(undefined);
                setPanelVista("crear-emergencia");
              }}
            >
              {emergenciasFiltradas.map((em) => (
                <MarkerMapa
                  key={em.id}
                  lat={em.latitud}
                  lng={em.longitud}
                  nivel={severidadANivel(em.severidad)}
                  tipo={em.tipo}
                />
              ))}
            </GoogleMapReact>

            <div className="mapa-zoom-controls">
              <button className="mapa-zoom-btn">+</button>
              <div className="mapa-divider" />
              <button className="mapa-zoom-btn">−</button>
            </div>

            <div className="mapa-zone-tools">
              {[
                { label: "Dibujar zona", icon: <Square size={14} /> },
                { label: "Editar zona",  icon: <Pencil size={14} /> },
                { label: "Borrar zona",  icon: <Trash2 size={14} /> },
              ].map((btn) => (
                <button
                  key={btn.label}
                  className={`zone-tool-btn${zonaActiva === btn.label ? " active" : ""}`}
                  onClick={() => setZonaActiva(btn.label)}
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
            </div>
          </div>

          {/* PANEL DERECHO */}
          <PanelDerecho
            theme={theme}
            vista={panelVista}
            setVista={setPanelVista}
            emergencia={emergenciaSeleccionada}
            centros={centros}
            centrosCargando={centrosCargando}
            onEditarEmergencia={() => abrirCrearEmergencia(emergenciaSeleccionada ?? undefined)}
            onUpdateEstado={handleUpdateEstado}
            onDeleteEmergencia={handleDeleteEmergencia}
            onCrearEmergencia={handleCrearEmergencia}
            onCrearCentro={handleCrearCentro}
            editData={editData}
            isCreating={createMutation.isPending}
            isUpdating={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        </div>

        {/* KPIs BARRA INFERIOR */}
        <div className="kpis-bar">
          {[
            { icono: <TrendingUp size={18} />, valor: String(kpis.totalActivas),                                  etiqueta: "Emergencias activas",           colorClass: "kpi-emergencias" },
            { icono: <Users size={18} />,      valor: kpis.totalAfectados.toLocaleString("es-CL"),                etiqueta: "Personas afectadas",            colorClass: "kpi-personas" },
            { icono: <AlertTriangle size={18}/>,valor: String(kpis.totalCriticas),                                etiqueta: "Emergencias críticas",          colorClass: "kpi-emergencias" },
            { icono: <Home size={18} />,        valor: String(centros.filter((c) => c.estado === "Abierto").length), etiqueta: "Centros de acopio operativos",  colorClass: "" },
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

      {/* PANEL IA — overlay */}
      {mostrarIA && (
        <PanelIA
          emergencias={emergencias}
          onClose={() => setMostrarIA(false)}
        />
      )}
    </div>
  );
}

