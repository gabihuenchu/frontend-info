'use client';

import { useEffect, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

/** Un solo id en toda la app: evita "Loader must not be called again with different options". */
export const CATASTROFES_GOOGLE_MAPS_ID = 'catastrofescl-maps';

/**
 * Clave horneada en BUILD (NEXT_PUBLIC_*). Si la imagen se construyó sin pasar el
 * build-arg, queda vacía y se completa en RUNTIME desde /api/config-publica.
 */
export function getGoogleMapsApiKey(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    ''
  );
}

// Caché de la clave resuelta en runtime, compartida por toda la app para no
// repetir el fetch a /api/config-publica en cada componente que use mapas.
let claveRuntimeCache: string | null = null;
let promesaRuntime: Promise<string> | null = null;

async function cargarClaveRuntime(): Promise<string> {
  if (claveRuntimeCache !== null) return claveRuntimeCache;
  if (typeof window === 'undefined') return '';

  if (!promesaRuntime) {
    promesaRuntime = (async () => {
      try {
        const resp = await fetch('/api/config-publica', { cache: 'no-store' });
        if (!resp.ok) return '';
        const cfg = (await resp.json()) as { googleMapsApiKey?: string };
        claveRuntimeCache = (cfg.googleMapsApiKey ?? '').trim();
        return claveRuntimeCache;
      } catch (e) {
        console.warn('No se pudo cargar la clave de Google Maps en runtime:', e);
        return '';
      }
    })();
  }

  return promesaRuntime;
}

/**
 * Devuelve la clave de Google Maps priorizando la horneada en build y, si no existe,
 * la obtiene en runtime desde /api/config-publica. Úsalo en los componentes de mapa
 * para que funcionen tanto si se hornea la clave al construir como si se inyecta por
 * variables de entorno del contenedor (sin reconstruir la imagen).
 */
export function useGoogleMapsApiKey(): string {
  const claveBuild = getGoogleMapsApiKey();
  const [clave, setClave] = useState<string>(claveBuild || claveRuntimeCache || '');

  useEffect(() => {
    if (claveBuild) return;
    let activo = true;
    void cargarClaveRuntime().then((k) => {
      if (activo && k) setClave(k);
    });
    return () => {
      activo = false;
    };
  }, [claveBuild]);

  return clave;
}

export function useCatastrofesGoogleMaps(apiKey?: string) {
  const key = apiKey?.trim() || getGoogleMapsApiKey();
  return useJsApiLoader({
    id: CATASTROFES_GOOGLE_MAPS_ID,
    googleMapsApiKey: key,
  });
}
