'use client';

import React, { useCallback, useMemo } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Emergencia, SEVERIDAD_COLORS, TIPO_EMERGENCIA_LABELS } from '@/types/emergency';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './map.css';

interface EmergencyMapProps {
  emergencias: Emergencia[];
  loading: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  selectedEmergencia?: Emergencia | null;
  onSelectEmergencia?: (emergencia: Emergencia | null) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: -35.6762,
  lng: -71.5436,
};

const defaultZoom = 5;

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  emergencias,
  loading,
  onMapClick,
  selectedEmergencia,
  onSelectEmergencia,
}) => {
  const [mapRef, setMapRef] = React.useState<GoogleMap | null>(null);
  const [infoWindowId, setInfoWindowId] = React.useState<string | null>(null);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (onMapClick && e.latLng) {
        onMapClick(e.latLng.lat(), e.latLng.lng());
      }
    },
    [onMapClick]
  );

  const handleMarkerClick = useCallback(
    (emergencia: Emergencia) => {
      setInfoWindowId(emergencia.id);
      onSelectEmergencia?.(emergencia);
    },
    [onSelectEmergencia]
  );

  const options = useMemo(
    () => ({
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'administrative',
          elementType: 'geometry',
          stylers: [{ color: '#f2f2f2' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#e6f2ff' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }],
        },
      ],
    }),
    []
  );

  return (
    <div className="emergency-map-container">
      {loading && <div className="map-loading">Cargando mapa...</div>}
      
      <GoogleMap
        onLoad={(map) => setMapRef(map)}
        onUnmount={() => setMapRef(null)}
        onClick={handleMapClick}
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={defaultZoom}
        options={options}
      >
        {emergencias.map((emergencia) => (
          <React.Fragment key={emergencia.id}>
            <Marker
              position={{ lat: emergencia.latitud, lng: emergencia.longitud }}
              onClick={() => handleMarkerClick(emergencia)}
              title={emergencia.titulo}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: SEVERIDAD_COLORS[emergencia.severidad],
                fillOpacity: 0.8,
                strokeColor: '#fff',
                strokeWeight: 2,
              }}
              animation={emergencia.id === selectedEmergencia?.id ? google.maps.Animation.BOUNCE : undefined}
            />

            {infoWindowId === emergencia.id && onSelectEmergencia && (
              <InfoWindow
                position={{ lat: emergencia.latitud, lng: emergencia.longitud }}
                onCloseClick={() => setInfoWindowId(null)}
              >
                <div className="info-window-content">
                  <div className="info-window-header">
                    <h4>{emergencia.titulo}</h4>
                    <span className="badge" style={{ backgroundColor: SEVERIDAD_COLORS[emergencia.severidad] }}>
                      {emergencia.severidad}
                    </span>
                  </div>
                  <p><strong>Tipo:</strong> {TIPO_EMERGENCIA_LABELS[emergencia.tipo]}</p>
                  <p><strong>Región:</strong> {emergencia.region}</p>
                  <p><strong>Comuna:</strong> {emergencia.comuna}</p>
                  <p><strong>Estado:</strong> {emergencia.estado}</p>
                  {emergencia.afectados && (
                    <p><strong>Afectados:</strong> {emergencia.afectados.toLocaleString('es-CL')}</p>
                  )}
                  <p className="info-window-date">
                    {format(new Date(emergencia.fechaCreacion), 'dd MMM yyyy HH:mm', { locale: es })}
                  </p>
                </div>
              </InfoWindow>
            )}
          </React.Fragment>
        ))}
      </GoogleMap>

      <div className="map-hint">
        <p className="hint-text">💡 Haz clic en el mapa para crear una nueva emergencia</p>
      </div>
    </div>
  );
};

export default EmergencyMap;
