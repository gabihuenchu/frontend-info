'use client';

import { Moon, Sun } from 'lucide-react';

type MapThemeToggleProps = {
  mapDark: boolean;
  onChange: (dark: boolean) => void;
};

/** Toggle solo del mapa — no altera el tema global del dashboard */
export default function MapThemeToggle({ mapDark, onChange }: MapThemeToggleProps) {
  return (
    <button
      type="button"
      className="map-theme-toggle"
      onClick={() => onChange(!mapDark)}
      aria-label={mapDark ? 'Cambiar mapa a modo claro' : 'Cambiar mapa a modo oscuro'}
      title={mapDark ? 'Mapa: oscuro' : 'Mapa: claro'}
    >
      <span className="map-theme-toggle__icons" aria-hidden>
        <Sun size={13} className={mapDark ? '' : 'map-theme-toggle__icon--on'} />
        <Moon size={13} className={mapDark ? 'map-theme-toggle__icon--on' : ''} />
      </span>
      <span className="map-theme-toggle__track" aria-hidden>
        <span className={`map-theme-toggle__thumb${mapDark ? ' map-theme-toggle__thumb--dark' : ''}`} />
      </span>
    </button>
  );
}
