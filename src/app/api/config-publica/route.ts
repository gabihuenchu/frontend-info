import { NextResponse } from 'next/server';

// Siempre se evalúa en runtime dentro del contenedor (nunca se cachea en build),
// para que la configuración pública de Firebase se pueda definir por variables de
// entorno de runtime (sin prefijo NEXT_PUBLIC_) y la imagen no deba reconstruirse
// cada vez que cambien las claves o el host.
export const dynamic = 'force-dynamic';

/**
 * Expone la configuración pública de Firebase (web) y la clave de Google Maps que
 * el cliente necesita en el navegador. Ambas son claves públicas (pensadas para
 * vivir en el cliente), por lo que servirlas aquí es seguro. Al leerse en runtime,
 * se pueden definir por variables de entorno del contenedor sin reconstruir la imagen:
 *  - Firebase: FIREBASE_WEB_*
 *  - Google Maps: GOOGLE_MAPS_API_KEY (o NEXT_PUBLIC_GOOGLE_MAPS_API_KEY como respaldo)
 */
export async function GET() {
  const projectId = process.env.FIREBASE_WEB_PROJECT_ID ?? '';

  const googleMapsApiKey =
    process.env.GOOGLE_MAPS_API_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ??
    '';

  return NextResponse.json({
    apiKey: process.env.FIREBASE_WEB_API_KEY ?? '',
    projectId,
    authDomain:
      process.env.FIREBASE_WEB_AUTH_DOMAIN ?? (projectId ? `${projectId}.firebaseapp.com` : ''),
    appId: process.env.FIREBASE_WEB_APP_ID ?? '',
    storageBucket:
      process.env.FIREBASE_WEB_STORAGE_BUCKET ?? (projectId ? `${projectId}.appspot.com` : ''),
    messagingSenderId: process.env.FIREBASE_WEB_MESSAGING_SENDER_ID ?? '',
    googleMapsApiKey,
  });
}
