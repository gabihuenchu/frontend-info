"use client";

/**
 * Mapa Google: polígonos GeoJSON (zonas activas), epicentros, dibujo de zona de impacto.
 * Requiere NEXT_PUBLIC_GOOGLE_MAPS_API_KEY y Maps JavaScript API.
 * El dibujo de zonas usa clics en el mapa (DrawingManager fue retirado en Maps JS API 3.65).
 */

import { useCallback, useEffect, useMemo, useRef, type CSSProperties } from "react";
import { GoogleMap, Marker, Polygon } from "@react-google-maps/api";

import { useCatastrofesGoogleMaps } from "@/hooks/useGoogleMaps";
import type { Emergencia, EmergenciasGeoJsonCollection } from "@/services/emergency.service";
import { latLngRingFromGeoJson } from "@/services/emergency.service";

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

function fitMapToPaths(
  map: google.maps.Map,
  paths: google.maps.LatLngLiteral[],
  padding = 56
) {
  if (paths.length === 0) return;
  const bounds = new google.maps.LatLngBounds();
  for (const p of paths) bounds.extend(p);
  map.fitBounds(bounds, padding);
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
  const mapRef = useRef<google.maps.Map | null>(null);

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

  const geoIds = useMemo(
    () => new Set(geoFeatures.map((f) => f.properties.id)),
    [geoFeatures]
  );

  const emergenciasConZonaExtra = useMemo(
    () =>
      emergencias.filter(
        (em) => em.zonaImpacto && !geoIds.has(em.id)
      ),
    [emergencias, geoIds]
  );

  const emergenciasSinPoligono = useMemo(
    () =>
      emergencias.filter((em) => {
        const enGeo = geoIds.has(em.id);
        const tieneZona = Boolean(em.zonaImpacto?.coordinates?.[0]?.length);
        return !enGeo && !tieneZona;
      }),
    [emergencias, geoIds]
  );

  const pathsForEmergency = useCallback(
    (id: string): google.maps.LatLngLiteral[] => {
      const feature = geoFeatures.find((f) => f.properties.id === id);
      if (feature?.geometry?.coordinates?.[0]) {
        return ringToLatLngPath(feature.geometry.coordinates[0] as [number, number][]);
      }
      const em = emergencias.find((e) => e.id === id);
      if (em?.zonaImpacto) {
        return latLngRingFromGeoJson(em.zonaImpacto);
      }
      const emPoint = emergencias.find((e) => e.id === id);
      if (emPoint && emPoint.latitud && emPoint.longitud) {
        return [{ lat: emPoint.latitud, lng: emPoint.longitud }];
      }
      return [];
    },
    [geoFeatures, emergencias]
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const paths = pathsForEmergency(selectedId);
    if (paths.length >= 3) {
      fitMapToPaths(map, paths);
    } else if (paths.length === 1) {
      map.panTo(paths[0]);
      map.setZoom(Math.max(map.getZoom() ?? 8, 10));
    }
  }, [selectedId, pathsForEmergency]);

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
      onLoad={(map) => {
        mapRef.current = map;
      }}
      onUnmount={() => {
        mapRef.current = null;
      }}
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
              fillOpacity: isSel ? 0.35 : 0.2,
              strokeColor: isSel ? "#ea580c" : "#2563eb",
              strokeWeight: isSel ? 3 : 2,
              clickable: !dibujarActivo,
              zIndex: isSel ? 3 : 1,
            }}
          />
        );
      })}

      {emergenciasConZonaExtra.map((em) => {
        const paths = latLngRingFromGeoJson(em.zonaImpacto);
        if (paths.length < 3) return null;
        const isSel = em.id === selectedId;
        return (
          <Polygon
            key={`zona-${em.id}`}
            paths={paths}
            onClick={() => onSelectEmergenciaId(em.id)}
            options={{
              fillColor: isSel ? "#f97316" : "#3b82f6",
              fillOpacity: isSel ? 0.35 : 0.2,
              strokeColor: isSel ? "#ea580c" : "#2563eb",
              strokeWeight: isSel ? 3 : 2,
              clickable: !dibujarActivo,
              zIndex: isSel ? 3 : 1,
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
            zIndex: 4,
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

      {emergenciasSinPoligono.map((em) => (
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
