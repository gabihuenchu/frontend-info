import { NextResponse } from 'next/server';

// Siempre se evalúa en runtime dentro del contenedor (nunca se cachea en build),
// para que la configuración pública de Firebase se pueda definir por variables de
// entorno de runtime (sin prefijo NEXT_PUBLIC_) y la imagen no deba reconstruirse
// cada vez que cambien las claves o el host.
export const dynamic = 'force-dynamic';

/**
 * Expone la configuración pública de Firebase (web) que el cliente necesita para
 * inicializar Firebase Auth. La apiKey web de Firebase NO es secreta: está pensada
 * para vivir en el navegador, por lo que servirla aquí es seguro.
 */
export async function GET() {
  const projectId = process.env.FIREBASE_WEB_PROJECT_ID ?? '';

  return NextResponse.json({
    apiKey: process.env.FIREBASE_WEB_API_KEY ?? '',
    projectId,
    authDomain:
      process.env.FIREBASE_WEB_AUTH_DOMAIN ?? (projectId ? `${projectId}.firebaseapp.com` : ''),
    appId: process.env.FIREBASE_WEB_APP_ID ?? '',
    storageBucket:
      process.env.FIREBASE_WEB_STORAGE_BUCKET ?? (projectId ? `${projectId}.appspot.com` : ''),
    messagingSenderId: process.env.FIREBASE_WEB_MESSAGING_SENDER_ID ?? '',
  });
}
