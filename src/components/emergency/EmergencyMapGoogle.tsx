"use client";

/**
 * Mapa Google: polígonos GeoJSON (zonas activas), epicentros, dibujo de zona de impacto.
 * Requiere NEXT_PUBLIC_GOOGLE_MAPS_API_KEY y Maps JavaScript API.
 * El dibujo de zonas usa clics en el mapa (DrawingManager fue retirado en Maps JS API 3.65).
 */

import { useCallback, useMemo, type CSSProperties } from "react";
import { GoogleMap, Marker, Polygon } from "@react-google-maps/api";

import { useCatastrofesGoogleMaps } from "@/hooks/useGoogleMaps";
import type { Emergencia, EmergenciasGeoJsonCollection } from "@/services/emergency.service";

const mapContainerStyle: CSSProperties = {
  width: "100%",
  height: "100%",
};

const defaultCenter = { lat: -33.45, lng: -70.67 };

const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1a14" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7a7a6a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a14" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a0f1a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a1e" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#3a3a2a" }] },
];

function ringToLatLngPath(ring: [number, number][]): google.maps.LatLngLiteral[] {
  return ring.map(([lng, lat]) => ({ lat, lng }));
}

export type HerramientaZonaMapa = "Dibujar zona" | "Editar zona" | "Borrar zona";

interface EmergencyMapGoogleProps {
  apiKey: string;
  dark: boolean;
  emergencias: Emergencia[];
  geoJson?: EmergenciasGeoJsonCollection;
  herramientaZona: HerramientaZonaMapa;
  poligonoBorrador: google.maps.LatLngLiteral[] | null;
  onPoligonoBorradorChange: (path: google.maps.LatLngLiteral[] | null) => void;
  selectedId: string | null;
  onSelectEmergenciaId: (id: string) => void;
}

export default function EmergencyMapGoogle({
  apiKey,
  dark,
  emergencias,
  geoJson,
  herramientaZona,
  poligonoBorrador,
  onPoligonoBorradorChange,
  selectedId,
  onSelectEmergenciaId,
}: EmergencyMapGoogleProps) {
  const { isLoaded, loadError } = useCatastrofesGoogleMaps(apiKey);

  const dibujarActivo = herramientaZona === "Dibujar zona";

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!dibujarActivo || !event.latLng) return;
      const point = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      const prev = poligonoBorrador ?? [];
      onPoligonoBorradorChange([...prev, point]);
    },
    [dibujarActivo, poligonoBorrador, onPoligonoBorradorChange]
  );

  const geoFeatures = useMemo(() => geoJson?.features ?? [], [geoJson?.features]);

  if (!apiKey?.trim()) {
    return (
      <div style={{ padding: 24, fontSize: 13, color: "var(--color-text-secondary, #9ca3af)" }}>
        Configura <code style={{ fontSize: 12 }}>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> en el entorno para
        habilitar el mapa y el dibujo de zonas.
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: 24, color: "#fca5a5", fontSize: 13 }}>
        No se pudo cargar Google Maps. Verifica NEXT_PUBLIC_GOOGLE_MAPS_API_KEY y que Maps JavaScript API esté habilitada.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ padding: 24, color: "var(--color-text-secondary)", fontSize: 13 }}>
        Cargando mapa…
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={6}
      onClick={handleMapClick}
      options={{
        disableDefaultUI: true,
        zoomControl: false,
        draggableCursor: dibujarActivo ? "crosshair" : undefined,
        styles: dark ? darkMapStyles : [],
      }}
    >
      {geoFeatures.map((f) => {
        const ring = f.geometry?.coordinates?.[0] as [number, number][] | undefined;
        if (!ring?.length) return null;
        const paths = ringToLatLngPath(ring);
        const isSel = f.properties.id === selectedId;
        return (
          <Polygon
            key={f.properties.id}
            paths={paths}
            onClick={() => onSelectEmergenciaId(f.properties.id)}
            options={{
              fillColor: isSel ? "#f97316" : "#3b82f6",
              fillOpacity: isSel ? 0.28 : 0.18,
              strokeColor: isSel ? "#ea580c" : "#2563eb",
              strokeWeight: isSel ? 3 : 2,
              clickable: !dibujarActivo,
            }}
          />
        );
      })}

      {poligonoBorrador && poligonoBorrador.length >= 2 && (
        <Polygon
          paths={poligonoBorrador}
          options={{
            fillColor: "#22c55e",
            fillOpacity: 0.2,
            strokeColor: "#16a34a",
            strokeWeight: 2,
            clickable: false,
            zIndex: 2,
          }}
        />
      )}

      {poligonoBorrador?.map((point, index) => (
        <Marker
          key={`draft-${index}`}
          position={point}
          clickable={false}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: "#16a34a",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 1,
          }}
        />
      ))}

      {emergencias.map((em) => (
        <Marker
          key={`m-${em.id}`}
          position={{ lat: em.latitud, lng: em.longitud }}
          onClick={() => onSelectEmergenciaId(em.id)}
          title={em.region}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: em.id === selectedId ? 10 : 8,
            fillColor: em.severidad === "CRITICA" || em.severidad === "ALTA" ? "#ef4444" : "#f97316",
            fillOpacity: 0.95,
            strokeColor: "#fff",
            strokeWeight: 2,
          }}
        />
      ))}
    </GoogleMap>
  );
}
