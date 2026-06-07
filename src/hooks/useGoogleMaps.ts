'use client';

import { useJsApiLoader } from '@react-google-maps/api';

/** Un solo id en toda la app: evita "Loader must not be called again with different options". */
export const CATASTROFES_GOOGLE_MAPS_ID = 'catastrofescl-maps';

export function getGoogleMapsApiKey(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    ''
  );
}

export function useCatastrofesGoogleMaps(apiKey?: string) {
  const key = apiKey?.trim() || getGoogleMapsApiKey();
  return useJsApiLoader({
    id: CATASTROFES_GOOGLE_MAPS_ID,
    googleMapsApiKey: key,
  });
}
