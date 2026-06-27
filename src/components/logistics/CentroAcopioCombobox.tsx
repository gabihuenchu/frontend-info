'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import type { CentroAcopioLogistica } from '@/types/resources';

interface CentroAcopioComboboxProps {
  label: string;
  centros: CentroAcopioLogistica[];
  value: string;
  onChange: (centroId: string) => void;
  loading?: boolean;
  error?: boolean;
  excludeId?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Devuelve la etiqueta legible de la emergencia del centro (o null si no tiene). */
  resolverEtiquetaEmergencia?: (emergenciaId?: string | null) => string | null;
}

/** Prioriza ACTIVO/SATURADO sobre INACTIVO/CERRADO para que aparezcan primero. */
function rankEstado(estado: string): number {
  const e = estado?.toUpperCase();
  if (e === 'ACTIVO') return 0;
  if (e === 'SATURADO') return 1;
  if (e === 'INACTIVO') return 2;
  return 3;
}

export default function CentroAcopioCombobox({
  label,
  centros,
  value,
  onChange,
  loading = false,
  error = false,
  excludeId,
  placeholder = 'Buscar por nombre, comuna o región…',
  disabled = false,
  resolverEtiquetaEmergencia,
}: CentroAcopioComboboxProps) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const contenedorRef = useRef<HTMLDivElement>(null);

  const seleccionado = useMemo(
    () => centros.find((c) => c.id === value) ?? null,
    [centros, value]
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return centros
      .filter((c) => c.id !== excludeId)
      .filter((c) => {
        if (!q) return true;
        const texto = [c.nombre, c.ciudad, c.region, c.direccion, c.id].join(' ').toLowerCase();
        return texto.includes(q);
      })
      .slice()
      .sort((a, b) => rankEstado(a.estado) - rankEstado(b.estado) || a.nombre.localeCompare(b.nombre));
  }, [busqueda, centros, excludeId]);

  const SIN_EMERGENCIA = '__sin_emergencia__';

  // Agrupa los centros por emergencia (mismo formato que donaciones); grupo final sin emergencia.
  const grupos = useMemo(() => {
    const map = new Map<string, { etiqueta: string; centros: CentroAcopioLogistica[] }>();
    for (const c of filtrados) {
      const etiqueta = resolverEtiquetaEmergencia?.(c.emergenciaId) ?? null;
      const key = etiqueta ?? SIN_EMERGENCIA;
      if (!map.has(key)) {
        map.set(key, { etiqueta: etiqueta ?? 'Centros sin emergencia activa', centros: [] });
      }
      map.get(key)!.centros.push(c);
    }
    const conEmergencia = [...map.entries()]
      .filter(([k]) => k !== SIN_EMERGENCIA)
      .sort((a, b) => a[1].etiqueta.localeCompare(b[1].etiqueta))
      .map(([, v]) => v);
    const sinEmergencia = map.get(SIN_EMERGENCIA);
    return sinEmergencia ? [...conEmergencia, sinEmergencia] : conEmergencia;
  }, [filtrados, resolverEtiquetaEmergencia]);

  useEffect(() => {
    if (!abierto) return;
    const onDocClick = (e: MouseEvent) => {
      if (!contenedorRef.current?.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [abierto]);

  useEffect(() => {
    if (seleccionado && !abierto) {
      setBusqueda(seleccionado.nombre);
    }
    if (!value && !abierto) {
      setBusqueda('');
    }
  }, [seleccionado, value, abierto]);

  const elegir = (c: CentroAcopioLogistica) => {
    onChange(c.id);
    setBusqueda(c.nombre);
    setAbierto(false);
  };

  return (
    <div className="logistics-combobox" ref={contenedorRef}>
      <span className="logistics-combobox__label">{label}</span>
      <div className={`logistics-combobox__control${abierto ? ' logistics-combobox__control--open' : ''}`}>
        <Search size={14} className="logistics-combobox__icon" aria-hidden />
        <input
          type="text"
          className="logistics-combobox__input"
          value={busqueda}
          placeholder={loading ? 'Cargando centros…' : placeholder}
          disabled={disabled || loading}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setAbierto(true);
            if (!e.target.value.trim()) onChange('');
          }}
          onFocus={() => setAbierto(true)}
        />
        <button
          type="button"
          className="logistics-combobox__toggle"
          onClick={() => setAbierto((v) => !v)}
          disabled={disabled || loading}
          aria-label="Mostrar centros"
        >
          <ChevronDown size={16} />
        </button>
      </div>
      {seleccionado && (
        <p className="logistics-combobox__hint">
          {seleccionado.ciudad}, {seleccionado.region} · {seleccionado.estado}
          {(() => {
            const etiqueta = resolverEtiquetaEmergencia?.(seleccionado.emergenciaId);
            return etiqueta ? ` · ${etiqueta}` : '';
          })()}
        </p>
      )}
      {abierto && !loading && (
        <ul
          className="logistics-combobox__list"
          role="listbox"
          style={{ maxHeight: 280, overflowY: 'auto' }}
        >
          {filtrados.length === 0 ? (
            <li className="logistics-combobox__empty">
              {centros.length === 0
                ? error
                  ? 'Error al cargar centros'
                  : 'No hay centros de acopio registrados'
                : 'Sin coincidencias'}
            </li>
          ) : (
            grupos.map((grupo) => (
              <li key={grupo.etiqueta} className="logistics-combobox__group-wrap">
                <div className="logistics-combobox__group">{grupo.etiqueta}</div>
                <ul role="group" aria-label={grupo.etiqueta} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {grupo.centros.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={c.id === value}
                        className={`logistics-combobox__option${c.id === value ? ' logistics-combobox__option--active' : ''}`}
                        onClick={() => elegir(c)}
                      >
                        <span className="logistics-combobox__option-name">{c.nombre}</span>
                        <span className="logistics-combobox__option-meta">
                          {c.ciudad} · {c.estado}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
