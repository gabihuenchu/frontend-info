"use client";

/**
 * Mapa Google: polígonos GeoJSON (zonas activas), epicentros, dibujo de zona de impacto.
 * Requiere NEXT_PUBLIC_GOOGLE_MAPS_API_KEY y Maps JavaScript API.
 * El dibujo de zonas usa clics en el mapa (DrawingManager fue retirado en Maps JS API 3.65).
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { GoogleMap, InfoWindow, Marker, Polygon } from "@react-google-maps/api";

import MapThemeToggle from "@/components/maps/MapThemeToggle";
import { useCatastrofesGoogleMaps } from "@/hooks/useGoogleMaps";
import { googleMapDarkStyles } from "@/lib/mapStyles";
import type { Emergencia, EmergenciasGeoJsonCollection } from "@/services/emergency.service";
import { etiquetaEmergenciaPorId, latLngRingFromGeoJson } from "@/services/emergency.service";
import type { EstadoCentro } from "@/types/resources";

/** Color del pin de centro de acopio segun su estado. */
const COLOR_CENTRO_POR_ESTADO: Record<EstadoCentro, string> = {
  ACTIVO: "#0d9488",
  SATURADO: "#f59e0b",
  INACTIVO: "#9ca3af",
  CERRADO: "#ef4444",
};

const ETIQUETA_ESTADO_CENTRO: Record<EstadoCentro, string> = {
  ACTIVO: "Activo",
  SATURADO: "Saturado",
  INACTIVO: "Inactivo",
  CERRADO: "Cerrado",
};

const mapContainerStyle: CSSProperties = {
  width: "100%",
  height: "100%",
};

const defaultCenter = { lat: -33.45, lng: -70.67 };

function ringToLatLngPath(ring: [number, number][]): google.maps.LatLngLiteral[] {
  return ring.map(([lng, lat]) => ({ lat, lng }));
}

export type HerramientaZonaMapa = "Dibujar zona" | "Editar zona" | "Borrar zona";

/** Centro de acopio en borrador colocado con un pin sobre el mapa. */
export interface CentroBorradorMapa {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
}

/** Centro de acopio persistido (ya creado en el backend) para dibujar en el mapa. */
export interface CentroPersistidoMapa {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  estado: EstadoCentro;
  capacidad?: number | null;
  emergenciaId?: string | null;
}

interface EmergencyMapGoogleProps {
  apiKey: string;
  /** Tema inicial del mapa (independiente del tema global tras el primer render) */
  defaultMapDark?: boolean;
  /** @deprecated Usar defaultMapDark */
  dark?: boolean;
  emergencias: Emergencia[];
  geoJson?: EmergenciasGeoJsonCollection;
  herramientaZona: HerramientaZonaMapa;
  poligonoBorrador: google.maps.LatLngLiteral[] | null;
  onPoligonoBorradorChange: (path: google.maps.LatLngLiteral[] | null) => void;
  selectedId: string | null;
  onSelectEmergenciaId: (id: string) => void;
  /** Si false, no se enfoca ni selecciona emergencias al clic en polígonos/marcadores (modo crear). */
  seleccionEnMapaHabilitada?: boolean;
  /** Cuando es true, el clic en el mapa coloca un pin de centro de acopio. */
  modoColocarCentro?: boolean;
  /** Centros de acopio en borrador a renderizar como pines. */
  centrosBorrador?: CentroBorradorMapa[];
  /** Se invoca al hacer clic en el mapa en modo colocar centro. */
  onAgregarCentroBorrador?: (punto: { lat: number; lng: number }) => void;
  /** Se invoca al arrastrar un pin de centro existente. */
  onMoverCentroBorrador?: (id: string, punto: { lat: number; lng: number }) => void;
  /** Centros de acopio persistidos (de la emergencia seleccionada) a dibujar como pines. */
  centrosPersistidos?: CentroPersistidoMapa[];
  /** Id del centro persistido enfocado: el mapa hace pan/zoom y abre su popup. */
  centroSeleccionadoId?: string | null;
  /** Se invoca al hacer clic en un pin de centro persistido. */
  onSelectCentro?: (id: string) => void;
  /** Se invoca al cerrar el popup del centro enfocado. */
  onCerrarCentro?: () => void;
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
  defaultMapDark,
  dark,
  emergencias,
  geoJson,
  herramientaZona,
  poligonoBorrador,
  onPoligonoBorradorChange,
  selectedId,
  onSelectEmergenciaId,
  seleccionEnMapaHabilitada = true,
  modoColocarCentro = false,
  centrosBorrador,
  onAgregarCentroBorrador,
  onMoverCentroBorrador,
  centrosPersistidos,
  centroSeleccionadoId,
  onSelectCentro,
  onCerrarCentro,
}: EmergencyMapGoogleProps) {
  const { isLoaded, loadError } = useCatastrofesGoogleMaps(apiKey);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapDark, setMapDark] = useState(defaultMapDark ?? dark ?? false);

  const dibujarActivo = herramientaZona === "Dibujar zona" && !modoColocarCentro;
  const mapaSeleccionable = seleccionEnMapaHabilitada && !dibujarActivo && !modoColocarCentro;

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      const point = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      if (modoColocarCentro) {
        onAgregarCentroBorrador?.(point);
        return;
      }
      if (!dibujarActivo) return;
      const prev = poligonoBorrador ?? [];
      onPoligonoBorradorChange([...prev, point]);
    },
    [dibujarActivo, modoColocarCentro, onAgregarCentroBorrador, poligonoBorrador, onPoligonoBorradorChange]
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
    if (!map || !selectedId || !seleccionEnMapaHabilitada) return;
    const paths = pathsForEmergency(selectedId);
    if (paths.length >= 3) {
      fitMapToPaths(map, paths);
    } else if (paths.length === 1) {
      map.panTo(paths[0]);
      map.setZoom(Math.max(map.getZoom() ?? 8, 10));
    }
  }, [selectedId, pathsForEmergency, seleccionEnMapaHabilitada]);

  const centrosConCoords = useMemo(
    () =>
      (centrosPersistidos ?? []).filter(
        (c) => typeof c.lat === "number" && typeof c.lng === "number"
      ),
    [centrosPersistidos]
  );

  const centroEnfocado = useMemo(
    () => centrosConCoords.find((c) => c.id === centroSeleccionadoId) ?? null,
    [centrosConCoords, centroSeleccionadoId]
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !centroEnfocado) return;
    map.panTo({ lat: centroEnfocado.lat, lng: centroEnfocado.lng });
    map.setZoom(Math.max(map.getZoom() ?? 8, 13));
  }, [centroEnfocado]);

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
    <div className="mapa-google-root">
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
        draggableCursor: dibujarActivo || modoColocarCentro ? "crosshair" : undefined,
        styles: mapDark ? googleMapDarkStyles : [],
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
              clickable: mapaSeleccionable,
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
              clickable: mapaSeleccionable,
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
          onClick={mapaSeleccionable ? () => onSelectEmergenciaId(em.id) : undefined}
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

      {centrosConCoords.map((centro) => {
        const seleccionado = centro.id === centroSeleccionadoId;
        return (
          <Marker
            key={`centro-persistido-${centro.id}`}
            position={{ lat: centro.lat, lng: centro.lng }}
            title={centro.nombre}
            onClick={onSelectCentro ? () => onSelectCentro(centro.id) : undefined}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: seleccionado ? 12 : 9,
              fillColor: COLOR_CENTRO_POR_ESTADO[centro.estado] ?? "#0d9488",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
            zIndex={seleccionado ? 6 : 5}
          />
        );
      })}

      {centroEnfocado && (
        <InfoWindow
          position={{ lat: centroEnfocado.lat, lng: centroEnfocado.lng }}
          onCloseClick={() => onCerrarCentro?.()}
          options={{ pixelOffset: new google.maps.Size(0, -10) }}
        >
          <div style={{ minWidth: 160, color: "#111827", fontSize: 12, lineHeight: 1.5 }}>
            <strong style={{ display: "block", fontSize: 13, marginBottom: 2 }}>
              {centroEnfocado.nombre}
            </strong>
            <span style={{ display: "block" }}>
              Estado: {ETIQUETA_ESTADO_CENTRO[centroEnfocado.estado] ?? centroEnfocado.estado}
            </span>
            <span style={{ display: "block" }}>
              Capacidad:{" "}
              {centroEnfocado.capacidad != null
                ? centroEnfocado.capacidad.toLocaleString("es-CL")
                : "No especificada"}
            </span>
            <span style={{ display: "block", marginTop: 2, color: "#374151" }}>
              Emergencia:{" "}
              {etiquetaEmergenciaPorId(centroEnfocado.emergenciaId, emergencias) ?? "Sin emergencia activa"}
            </span>
          </div>
        </InfoWindow>
      )}

      {(centrosBorrador ?? []).map((centro, index) => (
        <Marker
          key={`centro-borrador-${centro.id}`}
          position={{ lat: centro.lat, lng: centro.lng }}
          draggable={Boolean(onMoverCentroBorrador)}
          onDragEnd={(e) => {
            if (e.latLng && onMoverCentroBorrador) {
              onMoverCentroBorrador(centro.id, { lat: e.latLng.lat(), lng: e.latLng.lng() });
            }
          }}
          title={centro.nombre || `Centro de acopio ${index + 1}`}
          label={{
            text: String(index + 1),
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: "700",
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 11,
            fillColor: "#0d9488",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          }}
        />
      ))}
    </GoogleMap>
      <MapThemeToggle mapDark={mapDark} onChange={setMapDark} />
    </div>
  );
}
