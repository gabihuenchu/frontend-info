"use client";

import { useState } from "react";
import GoogleMapReact from "google-map-react";
import "@/styles/emergency.css";
import Sidebar from "@/components/sidebar";
import {
  Flame,
  Waves,
  Home,
  Zap,
  Mountain,
  CloudRain,
  Square,
  Pencil,
  Trash2,
  ClipboardList,
  AlertTriangle,
  Warehouse,
  Clock,
  MapPin,
  Edit3,
  Bell,
  FolderKanban,
  TrendingUp,
  Users,
  Truck,
  Plane,
  Moon,
  Sun,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type NivelAlerta = "ALTA" | "MEDIA" | "BAJA";
type ModalTipo = "emergencia" | "centro" | null;
type TipoEmergencia =
  | "Incendios Forestales"
  | "Alerta de Tsunami"
  | "Inundaciones"
  | "Terremoto"
  | "Erupción Volcánica"
  | "Aluvión";

interface Emergencia {
  id: string;
  tipo: TipoEmergencia;
  region: string;
  comunas: string;
  nivel: NivelAlerta;
  iniciada: string;
  lat: number;
  lng: number;
  descripcion: string;
  personasAfectadas: number;
  comunasAfectadas: number;
  hectareasQuemadas?: number;
}

interface CentroAcopio {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  region: string;
  distanciaKm: number;
  estado: "Abierto" | "En evaluación" | "Cerrado";
}

// ─── Datos mock ───────────────────────────────────────────────────────────────

const EMERGENCIAS_MOCK: Emergencia[] = [
  {
    id: "1",
    tipo: "Incendios Forestales",
    region: "Región de Valparaíso",
    comunas: "Quilpué, Villa Alemana, Limache",
    nivel: "ALTA",
    iniciada: "15 May 2024, 14:30",
    lat: -33.05,
    lng: -71.43,
    descripcion:
      "Incendios forestales activos en la zona interior de Valparaíso. Vientos fuertes y altas temperaturas favorecen la propagación.",
    personasAfectadas: 12450,
    comunasAfectadas: 5,
    hectareasQuemadas: 1240,
  },
  {
    id: "2",
    tipo: "Alerta de Tsunami",
    region: "Región de Atacama",
    comunas: "Caldera, Chañaral",
    nivel: "MEDIA",
    iniciada: "15 May 2024, 10:15",
    lat: -27.07,
    lng: -70.64,
    descripcion:
      "Alerta de tsunami tras sismo de 6.8 grados frente a la costa de Atacama.",
    personasAfectadas: 3200,
    comunasAfectadas: 2,
  },
  {
    id: "3",
    tipo: "Inundaciones",
    region: "Región del Biobío",
    comunas: "Curanilahue, Arauco",
    nivel: "BAJA",
    iniciada: "15 May 2024, 08:45",
    lat: -37.47,
    lng: -73.35,
    descripcion:
      "Inundaciones menores por lluvias intensas en zonas costeras del Biobío.",
    personasAfectadas: 3110,
    comunasAfectadas: 2,
  },
];

const CENTROS_MOCK: CentroAcopio[] = [
  {
    id: "1",
    nombre: "Gimnasio Municipal Quilpué",
    direccion: "Av. Condell 1234",
    ciudad: "Quilpué",
    region: "Valparaíso",
    distanciaKm: 2.4,
    estado: "Abierto",
  },
  {
    id: "2",
    nombre: "Colegio Valle del Sol",
    direccion: "Calle Los Carrera 567",
    ciudad: "Villa Alemana",
    region: "Valparaíso",
    distanciaKm: 4.1,
    estado: "Abierto",
  },
  {
    id: "3",
    nombre: "Junta de Vecinos Limache",
    direccion: "Av. República 789",
    ciudad: "Limache",
    region: "Valparaíso",
    distanciaKm: 6.3,
    estado: "En evaluación",
  },
  {
    id: "4",
    nombre: "Polideportivo Limache",
    direccion: "Av. Palmira Romano 432",
    ciudad: "Limache",
    region: "Valparaíso",
    distanciaKm: 7.8,
    estado: "Abierto",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const iconosPorTipo: Record<TipoEmergencia, React.ReactNode> = {
  "Incendios Forestales": <Flame size={16} />,
  "Alerta de Tsunami": <Waves size={16} />,
  Inundaciones: <CloudRain size={16} />,
  Terremoto: <Zap size={16} />,
  "Erupción Volcánica": <Mountain size={16} />,
  Aluvión: <Mountain size={16} />,
};

const nivelIconoBgClass: Record<NivelAlerta, string> = {
  ALTA: "icon-alta",
  MEDIA: "icon-media",
  BAJA: "icon-baja",
};

const nivelBadgeClass: Record<NivelAlerta, string> = {
  ALTA: "nivel-badge nivel-alta",
  MEDIA: "nivel-badge nivel-media",
  BAJA: "nivel-badge nivel-baja",
};

const nivelDotClass: Record<string, string> = {
  Alta: "nivel-dot nivel-dot-alta",
  Media: "nivel-dot nivel-dot-media",
  Baja: "nivel-dot nivel-dot-baja",
};

const estadoPillClass: Record<string, string> = {
  Abierto: "estado-pill estado-abierto",
  "En evaluación": "estado-pill estado-evaluacion",
  Cerrado: "estado-pill estado-cerrado",
};

const markerColor: Record<NivelAlerta, string> = {
  ALTA: "#ef4444",
  MEDIA: "#f97316",
  BAJA: "#22c55e",
};

// ─── Marker Mapa ─────────────────────────────────────────────────────────────

function MarkerMapa({
  nivel,
  tipo,
}: {
  nivel: NivelAlerta;
  lat: number;
  lng: number;
  tipo: TipoEmergencia;
}) {
  const color = markerColor[nivel];
  return (
    <div className="map-marker">
      <div
        className="map-marker-inner"
        style={{ backgroundColor: color, boxShadow: `0 0 14px ${color}80` }}
      >
        <span style={{ fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{iconosPorTipo[tipo]}</span>
      </div>
      <div className="map-marker-ping" style={{ backgroundColor: color }} />
    </div>
  );
}

// ─── Panel Derecho con Tabs y Formularios ─────────────────────────────────────

type VistaPanel = "detalles" | "crear-emergencia" | "centros" | "crear-centro";

function PanelDerecho({
  theme,
  vista,
  setVista,
  emergencia,
  onEditarEmergencia,
  editData,
}: {
  theme: string;
  vista: VistaPanel;
  setVista: (v: VistaPanel) => void;
  emergencia: Emergencia;
  onEditarEmergencia: () => void;
  editData?: { tipo: string; nivel: string; nombre: string };
}) {
  // Formularios locales
  const [formEmergencia, setFormEmergencia] = useState(
    editData ?? { tipo: "Incendios Forestales", nivel: "Alta", nombre: "" }
  );
  const [zonaActiva, setZonaActiva] = useState("Dibujar zona");
  const [formCentro, setFormCentro] = useState({
    nombre: "",
    direccion: "",
    lat: "",
    lng: "",
    capacidad: "",
  });

  // Actualizar form de emergencia cuando cambia editData
  useState(() => {
    if (editData) {
      setFormEmergencia(editData);
    }
  });

  const herramientasZona = [
    { id: "Dibujar zona", icono: <Square size={18} />, label: "Dibujar zona" },
    { id: "Editar zona", icono: <Pencil size={18} />, label: "Editar zona" },
    { id: "Borrar zona", icono: <Trash2 size={18} />, label: "Borrar zona" },
  ];

  return (
    <div className={`panel-derecho-nuevo ${theme}`}>
      {/* Tabs de navegación */}
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
            setFormEmergencia({ tipo: "Incendios Forestales", nivel: "Alta", nombre: "" });
            setVista("crear-emergencia");
          }}
        >
          <AlertTriangle size={14} className="mr-1" /> Crear Emergencia
        </button>
        <button
          className={`panel-tab${vista === "centros" || vista === "crear-centro" ? " panel-tab--active" : ""}`}
          onClick={() => setVista("centros")}
        >
          <Warehouse size={14} className="mr-1" /> Centros
        </button>
      </div>

      <div className="panel-derecho-content">
        {/* ─── VISTA: DETALLES ─── */}
        {vista === "detalles" && (
          <div className="panel-vista">
            <h3 className="panel-section-title">Detalle de Emergencia</h3>
            <div className="detalle-card">
              <div className="flex items-start justify-between gap-2" style={{ marginBottom: 8 }}>
                <div className="flex items-center gap-2">
                  <div className="detalle-icon-lg">
                    {iconosPorTipo[emergencia.tipo]}
                  </div>
                  <div>
                    <p className="detalle-nombre">{emergencia.tipo}</p>
                    <p className="detalle-region">{emergencia.region}</p>
                  </div>
                </div>
                <span className={nivelBadgeClass[emergencia.nivel]}>
                  {emergencia.nivel}
                </span>
              </div>

              <div className="emergencia-fecha" style={{ marginBottom: 8 }}>
                <Clock size={14} />
                <span>Iniciada: {emergencia.iniciada}</span>
              </div>

              <p className="detalle-desc">{emergencia.descripcion}</p>

              <div className="detalle-kpis">
                <div className="kpi-cell">
                  <p className="kpi-valor">
                    {emergencia.personasAfectadas.toLocaleString("es-CL")}
                  </p>
                  <p className="kpi-label">Personas afectadas</p>
                </div>
                <div className="kpi-cell">
                  <p className="kpi-valor">{emergencia.comunasAfectadas}</p>
                  <p className="kpi-label">Comunas afectadas</p>
                </div>
                {emergencia.hectareasQuemadas && (
                  <div className="kpi-cell">
                    <p className="kpi-valor">
                      {emergencia.hectareasQuemadas.toLocaleString("es-CL")}
                    </p>
                    <p className="kpi-label">Hectáreas quemadas</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2" style={{ marginTop: 4 }}>
                <button className="btn-informe" style={{ flex: 1 }}>VER INFORME →</button>
                <button
                  className="btn-guardar"
                  style={{ flex: 1, fontSize: 10 }}
                  onClick={onEditarEmergencia}
                >
                  <Edit3 size={12} className="mr-1" /> EDITAR
                </button>
              </div>
            </div>

            {/* Centros de acopio en vista detalles */}
            <div style={{ marginTop: 20 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <h3 className="panel-section-title" style={{ margin: 0 }}>
                  Centros de Acopio Cercanos
                </h3>
                <button
                  className="btn-nueva-emergencia"
                  style={{ fontSize: 10, padding: "4px 10px" }}
                  onClick={() => setVista("crear-centro")}
                >
                  + Nuevo
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {CENTROS_MOCK.slice(0, 3).map((c) => (
                  <button key={c.id} className="centro-row">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <div>
                        <p className="centro-nombre">{c.nombre}</p>
                        <p className="centro-ciudad">{c.ciudad}, {c.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="centro-distancia">{c.distanciaKm} km</span>
                      <span className={estadoPillClass[c.estado]}>{c.estado}</span>
                      <span style={{ fontSize: 14, opacity: 0.4 }}>›</span>
                    </div>
                  </button>
                ))}
              </div>

              <button className="link-ver-todas" style={{ marginTop: 4 }}>
                VER TODOS LOS CENTROS →
              </button>
            </div>
          </div>
        )}

        {/* ─── VISTA: CREAR/EDITAR EMERGENCIA ─── */}
        {vista === "crear-emergencia" && (
          <div className="panel-vista">
            <div className="panel-form-header">
              <h2 className="panel-form-title">CREAR ZONA DE EMERGENCIA</h2>
              <p className="panel-form-subtitle">Dibuja en el mapa para definir el área afectada</p>
            </div>

            {/* Herramientas de zona */}
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

            {/* Formulario */}
            <div className="panel-lateral-body" style={{ gap: "14px" }}>
              <div className="form-group">
                <label className="panel-form-label">Tipo de emergencia</label>
                <div className="panel-form-select-wrap">
                  <span className="panel-form-icon">{iconosPorTipo[formEmergencia.tipo as TipoEmergencia]}</span>
                  <select
                    className="panel-form-select"
                    value={formEmergencia.tipo}
                    onChange={(e) => setFormEmergencia({ ...formEmergencia, tipo: e.target.value })}
                  >
                    {Object.keys(iconosPorTipo).map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="panel-form-label">Nivel de alerta</label>
                <div className="panel-form-select-wrap">
                  <span className={`panel-form-dot dot-${formEmergencia.nivel.toLowerCase()}`} />
                  <select
                    className="panel-form-select"
                    value={formEmergencia.nivel}
                    onChange={(e) => setFormEmergencia({ ...formEmergencia, nivel: e.target.value })}
                  >
                    <option>Alta</option>
                    <option>Media</option>
                    <option>Baja</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="panel-form-label">Nombre de la emergencia</label>
                <input
                  type="text"
                  className="panel-form-input"
                  placeholder="Incendios Forestales - Valparaíso"
                  value={formEmergencia.nombre}
                  onChange={(e) => setFormEmergencia({ ...formEmergencia, nombre: e.target.value })}
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="panel-lateral-actions" style={{ marginTop: "auto", paddingTop: 16 }}>
              <button className="btn-panel-cancelar" onClick={() => setVista("detalles")}>Cancelar</button>
              <button className="btn-panel-guardar" onClick={() => setVista("detalles")}>Guardar emergencia</button>
            </div>
          </div>
        )}

        {/* ─── VISTA: LISTA DE CENTROS ─── */}
        {vista === "centros" && (
          <div className="panel-vista">
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <h3 className="panel-section-title" style={{ margin: 0 }}>
                Centros de Acopio
              </h3>
              <button
                className="btn-nueva-emergencia"
                style={{ fontSize: 10, padding: "4px 10px" }}
                onClick={() => setVista("crear-centro")}
              >
                + Nuevo
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CENTROS_MOCK.map((c) => (
                <button key={c.id} className="centro-row">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <div>
                      <p className="centro-nombre">{c.nombre}</p>
                      <p className="centro-ciudad">{c.ciudad}, {c.region}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="centro-distancia">{c.distanciaKm} km</span>
                    <span className={estadoPillClass[c.estado]}>{c.estado}</span>
                    <span style={{ fontSize: 14, opacity: 0.4 }}>›</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── VISTA: CREAR CENTRO ─── */}
        {vista === "crear-centro" && (
          <div className="panel-vista">
            <div className="panel-form-header">
              <h2 className="panel-form-title">CREAR CENTRO DE ACOPIO</h2>
              <p className="panel-form-subtitle">Registra nuevos centros para recibir donaciones</p>
            </div>

            <div className="panel-lateral-body" style={{ gap: "14px" }}>
              <div className="form-group">
                <label className="panel-form-label">Nombre del centro</label>
                <input
                  type="text"
                  className="panel-form-input"
                  placeholder="Ej: Gimnasio Municipal Quilpué"
                  value={formCentro.nombre}
                  onChange={(e) => setFormCentro({ ...formCentro, nombre: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="panel-form-label">Dirección</label>
                <input
                  type="text"
                  className="panel-form-input"
                  placeholder="Ej: Av. Condell 1234, Quilpué"
                  value={formCentro.direccion}
                  onChange={(e) => setFormCentro({ ...formCentro, direccion: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="panel-form-label">Coordenadas</label>
                <div className="coords-wrap">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="-33.0389"
                    value={formCentro.lat}
                    onChange={(e) => setFormCentro({ ...formCentro, lat: e.target.value })}
                  />
                  <span className="coords-sep">:</span>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="-71.4378"
                    value={formCentro.lng}
                    onChange={(e) => setFormCentro({ ...formCentro, lng: e.target.value })}
                  />
                  <button className="coords-pin-btn"><MapPin size={16} /></button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label className="panel-form-label">Capacidad estimada</label>
                  <select
                    className="form-select"
                    value={formCentro.capacidad}
                    onChange={(e) => setFormCentro({ ...formCentro, capacidad: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    <option>Pequeño (1-50)</option>
                    <option>Mediano (51-200)</option>
                    <option>Grande (200+)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="panel-form-label">Estado</label>
                  <div className="estado-inline">
                    <div className="estado-inline-dot" />
                    <span>Activo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-lateral-actions" style={{ marginTop: "auto", paddingTop: 16 }}>
              <button className="btn-panel-cancelar" onClick={() => setVista("centros")}>Cancelar</button>
              <button className="btn-panel-guardar" onClick={() => setVista("centros")}>Crear centro</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Toggle dark/light ────────────────────────────────────────────────────────

function ThemeToggle({
  dark,
  onToggle,
}: {
  dark: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className={`theme-toggle ${dark ? "theme-toggle--dark" : "theme-toggle--light"}`}
      onClick={onToggle}
      title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <span className="theme-toggle-icon">{dark ? <Moon size={14} /> : <Sun size={14} />}</span>
      <div className={`theme-toggle-track ${dark ? "track--dark" : "track--light"}`}>
        <div className={`theme-toggle-thumb ${dark ? "thumb--dark" : "thumb--light"}`} />
      </div>
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PaginaEmergencias() {
  const [dark, setDark] = useState(true);
  const [emergenciaSeleccionada, setEmergenciaSeleccionada] =
    useState<Emergencia>(EMERGENCIAS_MOCK[0]);
  const [panelDerechoVista, setPanelDerechoVista] = useState<
    "detalles" | "crear-emergencia" | "centros" | "crear-centro"
  >("detalles");
  const [editData, setEditData] = useState<
    { tipo: string; nivel: string; nombre: string } | undefined
  >(undefined);
  const [filtroRegion, setFiltroRegion] = useState("Todas las regiones");
  const [filtroTipo, setFiltroTipo] = useState("Todos los tipos");
  const [zonaActiva, setZonaActiva] = useState("Dibujar zona");

  const theme = dark ? "dark" : "light";

  const abrirCrearEmergencia = (em?: Emergencia) => {
    if (em) {
      setEditData({
        tipo: em.tipo,
        nivel: em.nivel.charAt(0) + em.nivel.slice(1).toLowerCase(),
        nombre: em.tipo + " - " + em.region.replace("Región de ", "").replace("Región del ", ""),
      });
    } else {
      setEditData(undefined);
    }
    setPanelDerechoVista("crear-emergencia");
  };

  const abrirCrearCentro = () => {
    setPanelDerechoVista("crear-centro");
  };

  return (
    <>
      {/* ── Modales ── */}

      <div className={`dashboard-root ${theme}`}>

        {/* ══════════════════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════════════════ */}
        <Sidebar
          dark={dark}
          setDark={setDark}
        />

        {/* ══════════════════════════════════════════════════
            CONTENIDO PRINCIPAL
        ══════════════════════════════════════════════════ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* ── Header ── */}
          <header className="dashboard-header">
            <div>
              <h1 className="header-title">EMERGENCIAS EN TIEMPO REAL</h1>
              <p className="header-subtitle">Monitoreo y gestión de catástrofes activas en Chile</p>
            </div>
            <div className="header-controls">
              <select className="header-select" value={filtroRegion} onChange={(e) => setFiltroRegion(e.target.value)}>
                <option>Todas las regiones</option>
                <option>Región de Valparaíso</option>
                <option>Región de Atacama</option>
                <option>Región del Biobío</option>
              </select>
              <select className="header-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                <option>Todos los tipos</option>
                <option>Incendios Forestales</option>
                <option>Alerta de Tsunami</option>
                <option>Inundaciones</option>
              </select>
              <button className="header-bell">
                <Bell size={18} />
                <span className="bell-badge">3</span>
              </button>
              <button className="btn-nueva-emergencia" onClick={() => { setEditData(undefined); setPanelDerechoVista("crear-emergencia"); }}>
                <span>+</span>
                <span>Nueva emergencia</span>
              </button>
            </div>
          </header>

          {/* ── Cuerpo ── */}
          <div className="dashboard-body">

            {/* ════════════════════════════════════════════
                LISTA EMERGENCIAS
            ════════════════════════════════════════════ */}
            <div className="emergencias-list">
              <div className="emergencias-scroll">
                <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                  <h2 className="section-label">
                    Emergencias Activas
                    <span className="count-badge">{EMERGENCIAS_MOCK.length}</span>
                  </h2>
                </div>

                {EMERGENCIAS_MOCK.map((em) => {
                  const activa = emergenciaSeleccionada.id === em.id;
                  return (
                    <div key={em.id} className={`emergencia-card${activa ? " selected" : ""}`}>
                      <div className="emergencia-card-header">
                        <div className="flex items-center gap-2">
                          <div className={`emergencia-icon-wrap ${nivelIconoBgClass[em.nivel]}`}>
                            {iconosPorTipo[em.tipo]}
                          </div>
                          <span className="emergencia-tipo">{em.tipo}</span>
                        </div>
                        <span className={nivelBadgeClass[em.nivel]}>{em.nivel}</span>
                      </div>
                      <p className="emergencia-region">{em.region}</p>
                      <p className="emergencia-comunas">{em.comunas}</p>
                      <div className="emergencia-fecha">
                        <Clock size={12} />
                        <span>Iniciada: {em.iniciada}</span>
                      </div>

                      {/* Botones acción */}
                      <div className="emergencia-actions">
                        <button
                          className="card-action-btn"
                          onClick={() => setEmergenciaSeleccionada(em)}
                        >
                          <ClipboardList size={12} className="mr-1" /> Detalles
                        </button>
                        <button
                          className="card-action-btn card-action-btn--edit"
                          onClick={() => abrirCrearEmergencia(em)}
                        >
                          <Edit3 size={12} className="mr-1" /> Editar
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button className="link-ver-todas">Ver todas las emergencias →</button>
              </div>
            </div>

            {/* ════════════════════════════════════════════
                MAPA
            ════════════════════════════════════════════ */}
            <div className="mapa-container">
              <GoogleMapReact
                bootstrapURLKeys={{ key: "" }}
                defaultCenter={{ lat: -35.5, lng: -71.0 }}
                defaultZoom={5}
                options={{
                  styles: dark
                    ? [
                        { elementType: "geometry", stylers: [{ color: "#1a1a14" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#7a7a6a" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a14" }] },
                        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a0f1a" }] },
                        { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a1e" }] },
                        { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#3a3a2a" }] },
                      ]
                    : [],
                  disableDefaultUI: true,
                  zoomControl: false,
                }}
              >
                {EMERGENCIAS_MOCK.map((em) => (
                  <MarkerMapa key={em.id} lat={em.lat} lng={em.lng} nivel={em.nivel} tipo={em.tipo} />
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
                  { label: "Editar zona", icon: <Pencil size={14} /> },
                  { label: "Borrar zona", icon: <Trash2 size={14} /> },
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

            {/* ════════════════════════════════════════════
                PANEL DERECHO — CON TABS Y CONTENIDO DINÁMICO
            ════════════════════════════════════════════ */}
            <PanelDerecho
              theme={theme}
              vista={panelDerechoVista}
              setVista={setPanelDerechoVista}
              emergencia={emergenciaSeleccionada}
              onEditarEmergencia={() => abrirCrearEmergencia(emergenciaSeleccionada)}
              editData={editData}
            />
          </div>

          {/* ════════════════════════════════════════════════
              BARRA KPIs INFERIOR
          ════════════════════════════════════════════════ */}
          <div className="kpis-bar">
            {[
              { icono: <TrendingUp size={18} />, valor: "3", etiqueta: "Emergencias activas", colorClass: "kpi-emergencias" },
              { icono: <Users size={18} />, valor: "18.760", etiqueta: "Personas afectadas", colorClass: "kpi-personas" },
              { icono: <Home size={18} />, valor: "45", etiqueta: "Centros de acopio operativos", colorClass: "" },
              { icono: <Truck size={18} />, valor: "28", etiqueta: "Despachos en curso", colorClass: "" },
              { icono: <Plane size={18} />, valor: "7", etiqueta: "Recursos de apoyo desplegados", colorClass: "" },
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
      </div>
    </>
  );
}