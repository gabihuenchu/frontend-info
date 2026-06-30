'use client';

import { useMemo, useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import MapThemeToggle from '@/components/maps/MapThemeToggle';
import { useDashboardTheme } from '@/providers/DashboardThemeProvider';
import { useCatastrofesGoogleMaps, useGoogleMapsApiKey } from '@/hooks/useGoogleMaps';
import { googleMapDarkStyles } from '@/lib/mapStyles';
import type { CentroDetalle, EstadoCentro } from '@/types/resources';

const center = { lat: -35.5, lng: -71.5 };

const colorPorEstado: Record<EstadoCentro, string> = {
  ACTIVO: '#22c55e',
  SATURADO: '#f59e0b',
  INACTIVO: '#9ca3af',
  CERRADO: '#ef4444',
};

interface CentrosMapaProps {
  centros: CentroDetalle[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function CentrosMapa({ centros, selectedId, onSelect }: CentrosMapaProps) {
  const { dark } = useDashboardTheme();
  const [mapDark, setMapDark] = useState(dark);
  const apiKey = useGoogleMapsApiKey();
  const { isLoaded, loadError } = useCatastrofesGoogleMaps(apiKey);

  const conCoords = useMemo(
    () => centros.filter((c) => typeof c.latitud === 'number' && typeof c.longitud === 'number'),
    [centros]
  );

  if (!apiKey) {
    return (
      <div className="logistics-map-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text-tertiary, #6b7280)' }}>
          Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        </span>
      </div>
    );
  }

  if (loadError || !isLoaded) {
    return (
      <div className="logistics-map-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text-tertiary, #6b7280)' }}>Cargando mapa…</span>
      </div>
    );
  }

  const primero = conCoords[0];

  return (
    <div className="logistics-map-wrap mapa-google-root">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={primero ? { lat: primero.latitud!, lng: primero.longitud! } : center}
        zoom={primero ? 6 : 5}
        options={{ disableDefaultUI: true, styles: mapDark ? googleMapDarkStyles : [] }}
      >
        {conCoords.map((c) => (
          <Marker
            key={c.id}
            position={{ lat: c.latitud!, lng: c.longitud! }}
            title={c.nombre}
            onClick={() => onSelect(c.id)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: c.id === selectedId ? 11 : 8,
              fillColor: colorPorEstado[c.estado] ?? '#7ab648',
              fillOpacity: 0.95,
              strokeColor: '#fff',
              strokeWeight: 2,
            }}
          />
        ))}
      </GoogleMap>
      <MapThemeToggle mapDark={mapDark} onChange={setMapDark} />
    </div>
  );
}
