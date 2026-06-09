"use client";

import { useEffect, useState } from "react";
import { Bell, Edit3, Loader2, MapPin, Save, X } from "lucide-react";
import type {
  ActualizarAnuncioRequest,
  AlcanceAnuncio,
  AnuncioResponseDto,
  SeveridadAnuncio,
} from "@/services/emergency.service";
import { formatApiError } from "@/lib/api-errors";

const SEVERIDADES: SeveridadAnuncio[] = ["INFORMATIVO", "IMPORTANTE", "URGENTE", "EMERGENCIA"];
const ALCANCES: AlcanceAnuncio[] = ["NACIONAL", "REGIONAL", "COMUNAL"];

const severidadLabel: Record<SeveridadAnuncio, string> = {
  INFORMATIVO: "Informativo",
  IMPORTANTE: "Importante",
  URGENTE: "Urgente",
  EMERGENCIA: "Emergencia",
};

const alcanceLabel: Record<AlcanceAnuncio, string> = {
  NACIONAL: "Nacional",
  REGIONAL: "Regional",
  COMUNAL: "Comunal",
};

type Props = {
  anuncio: AnuncioResponseDto;
  regiones: string[];
  onGuardar: (id: string, data: ActualizarAnuncioRequest) => Promise<void>;
  guardando: boolean;
};

export default function AnuncioCardEditable({ anuncio, regiones, onGuardar, guardando }: Props) {
  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState(anuncio.titulo);
  const [contenido, setContenido] = useState(anuncio.contenido);
  const [severidad, setSeveridad] = useState<SeveridadAnuncio>(anuncio.severidad);
  const [alcance, setAlcance] = useState<AlcanceAnuncio>(anuncio.alcance);
  const [region, setRegion] = useState(anuncio.region ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editando) {
      setTitulo(anuncio.titulo);
      setContenido(anuncio.contenido);
      setSeveridad(anuncio.severidad);
      setAlcance(anuncio.alcance);
      setRegion(anuncio.region ?? "");
    }
  }, [anuncio, editando]);

  const cancelar = () => {
    setTitulo(anuncio.titulo);
    setContenido(anuncio.contenido);
    setSeveridad(anuncio.severidad);
    setAlcance(anuncio.alcance);
    setRegion(anuncio.region ?? "");
    setError(null);
    setEditando(false);
  };

  const guardar = async () => {
    setError(null);
    const tituloTrim = titulo.trim();
    const contenidoTrim = contenido.trim();
    if (!tituloTrim || !contenidoTrim) {
      setError("Título y contenido son obligatorios.");
      return;
    }
    try {
      await onGuardar(anuncio.id, {
        titulo: tituloTrim,
        contenido: contenidoTrim,
        severidad,
        alcance,
        region: region.trim() || null,
        vigenteHasta: anuncio.vigenteHasta,
      });
      setEditando(false);
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  const severityClass = `severity-${anuncio.severidad.toLowerCase()}`;

  if (editando) {
    return (
      <article className={`anuncio-dash-card anuncio-dash-card--editing ${severityClass}`}>
        <div className="anuncio-dash-card__header">
          <span className="anuncio-dash-card__tag">
            <Bell size={12} />
            Editando anuncio
          </span>
        </div>

        <div className="anuncio-dash-card__form">
          <div className="form-group">
            <label className="panel-form-label">Título</label>
            <input
              className="panel-form-input"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="form-group">
            <label className="panel-form-label">Contenido</label>
            <textarea
              className="panel-form-textarea"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={4}
            />
          </div>
          <div className="anuncio-dash-card__form-row">
            <div className="form-group">
              <label className="panel-form-label">Severidad</label>
              <select
                className="panel-form-select"
                value={severidad}
                onChange={(e) => setSeveridad(e.target.value as SeveridadAnuncio)}
              >
                {SEVERIDADES.map((s) => (
                  <option key={s} value={s}>
                    {severidadLabel[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="panel-form-label">Alcance</label>
              <select
                className="panel-form-select"
                value={alcance}
                onChange={(e) => setAlcance(e.target.value as AlcanceAnuncio)}
              >
                {ALCANCES.map((a) => (
                  <option key={a} value={a}>
                    {alcanceLabel[a]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="panel-form-label">Región</label>
            <select
              className="panel-form-select"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">Nacional (sin región)</option>
              {regiones.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="anuncio-dash-card__error">{error}</p>}

        <div className="anuncio-dash-card__actions">
          <button type="button" className="anuncio-dash-card__btn anuncio-dash-card__btn--ghost" onClick={cancelar} disabled={guardando}>
            <X size={14} />
            Cancelar
          </button>
          <button type="button" className="anuncio-dash-card__btn anuncio-dash-card__btn--save" onClick={guardar} disabled={guardando}>
            {guardando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className={`anuncio-dash-card ${severityClass}`}>
      <div className="anuncio-dash-card__header">
        <span className="anuncio-dash-card__tag">{severidadLabel[anuncio.severidad]}</span>
        <div className="anuncio-dash-card__meta">
          <time className="anuncio-dash-card__time">
            {new Date(anuncio.creadoEn).toLocaleString("es-CL", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
          <button
            type="button"
            className="anuncio-dash-card__edit"
            onClick={() => setEditando(true)}
            title="Editar anuncio"
            aria-label="Editar anuncio"
          >
            <Edit3 size={14} />
          </button>
        </div>
      </div>

      <h4 className="anuncio-dash-card__title">{anuncio.titulo}</h4>
      <p className="anuncio-dash-card__content">{anuncio.contenido}</p>

      <footer className="anuncio-dash-card__footer">
        <span className="anuncio-dash-card__region">
          <MapPin size={12} />
          {anuncio.region || "Nacional"}
        </span>
        <span className="anuncio-dash-card__alcance">{alcanceLabel[anuncio.alcance]}</span>
      </footer>
    </article>
  );
}
