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
      .slice(0, 12);
  }, [busqueda, centros, excludeId]);

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
        </p>
      )}
      {abierto && !loading && (
        <ul className="logistics-combobox__list" role="listbox">
          {filtrados.length === 0 ? (
            <li className="logistics-combobox__empty">
              {centros.length === 0
                ? error
                  ? 'Error al cargar centros'
                  : 'No hay centros de acopio registrados'
                : 'Sin coincidencias'}
            </li>
          ) : (
            filtrados.map((c) => (
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
            ))
          )}
        </ul>
      )}
    </div>
  );
}
