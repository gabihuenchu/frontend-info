'use client';

import { useMemo } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useCatastrofesGoogleMaps, getGoogleMapsApiKey } from '@/hooks/useGoogleMaps';
import { MOCK_MAPA_PUNTOS } from '@/lib/mocks/logistics-mock';

const center = { lat: -35.5, lng: -71.5 };

const darkStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1a2218' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1210' }] },
];

const markerColor: Record<string, string> = {
  centro: '#22c55e',
  transferencia: '#3b82f6',
  mision: '#f97316',
  voluntario: '#a855f7',
};

export default function LogisticsMap() {
  const apiKey = getGoogleMapsApiKey();
  const { isLoaded, loadError } = useCatastrofesGoogleMaps(apiKey);

  const puntos = useMemo(() => MOCK_MAPA_PUNTOS, []);

  if (!apiKey) {
    return (
      <div className="logistics-map-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--log-muted)', fontSize: 13 }}>Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span>
      </div>
    );
  }

  if (loadError || !isLoaded) {
    return (
      <div className="logistics-map-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--log-muted)', fontSize: 13 }}>Cargando mapa logístico…</span>
      </div>
    );
  }

  return (
    <div className="logistics-map-wrap">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={5}
        options={{ disableDefaultUI: true, styles: darkStyles }}
      >
        {puntos.map((p) => (
          <Marker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
            title={p.label}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: p.tipo === 'mision' ? 9 : 7,
              fillColor: markerColor[p.tipo] ?? '#7ab648',
              fillOpacity: 0.95,
              strokeColor: '#fff',
              strokeWeight: 2,
            }}
          />
        ))}
      </GoogleMap>
      <div className="logistics-map-legend">
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Leyenda</div>
        <div>🟢 Centro de Acopio</div>
        <div>🔵 Transferencia</div>
        <div>🟠 Misión Activa</div>
        <div>🟣 Voluntario</div>
      </div>
    </div>
  );
}
