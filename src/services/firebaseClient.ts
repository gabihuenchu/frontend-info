import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const fallbackProjectId = 'catastrofescl-dev';

interface FirebaseWebConfig {
  apiKey?: string;
  projectId?: string;
  authDomain?: string;
  appId?: string;
}

// La configuración es mutable: se siembra con las variables de BUILD
// (NEXT_PUBLIC_FIREBASE_*) si existen, y si no, se completa en RUNTIME desde
// /api/config-publica (ver inicializarFirebaseRuntime). Así la imagen funciona
// tanto si se hornean las claves al construir como si se inyectan en runtime.
const firebaseConfig: FirebaseWebConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || undefined,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ? `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`
      : undefined),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | null = null;
let firebaseAppInitialized = false;
let firebaseDevWarned = false;
let runtimeConfigPromise: Promise<void> | null = null;

function tieneConfigValida(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key_here');
}

/**
 * Completa la configuración de Firebase en runtime desde /api/config-publica
 * cuando NO se hornearon las claves en build (NEXT_PUBLIC_FIREBASE_*).
 * Es idempotente y solo se ejecuta en el navegador. Debe llamarse (await) antes
 * de usar getFirebaseAuthClient() en el arranque de la app.
 */
export async function inicializarFirebaseRuntime(): Promise<void> {
  // Si ya hay apiKey (horneada en build) no se necesita runtime.
  if (tieneConfigValida()) return;
  if (typeof window === 'undefined') return;

  if (!runtimeConfigPromise) {
    runtimeConfigPromise = (async () => {
      try {
        const resp = await fetch('/api/config-publica', { cache: 'no-store' });
        if (!resp.ok) return;
        const cfg = (await resp.json()) as FirebaseWebConfig;
        if (cfg.apiKey) {
          firebaseConfig.apiKey = cfg.apiKey;
          firebaseConfig.projectId = cfg.projectId || firebaseConfig.projectId;
          firebaseConfig.authDomain =
            cfg.authDomain ||
            (cfg.projectId ? `${cfg.projectId}.firebaseapp.com` : firebaseConfig.authDomain);
          firebaseConfig.appId = cfg.appId || firebaseConfig.appId;
        }
      } catch (e) {
        console.warn('No se pudo cargar la configuración de Firebase en runtime:', e);
      }
    })();
  }

  return runtimeConfigPromise;
}

function ensureFirebaseConfig() {
  const missingKeys = [];

  if (!firebaseConfig.apiKey) {
    missingKeys.push('apiKey');
  }

  if (!firebaseConfig.projectId) {
    missingKeys.push('projectId');
  }

  if (missingKeys.length > 0) {
    throw new Error(
      `Falta configurar Firebase en el frontend: ${missingKeys.join(', ')}. ` +
        'Define NEXT_PUBLIC_FIREBASE_* (build) o FIREBASE_WEB_* (runtime).'
    );
  }
}

export function getFirebaseAuthClient() {
  // Sin credenciales (ni build ni runtime aún): retornar null sin romper la app.
  if (!tieneConfigValida()) {
    if (!firebaseDevWarned) {
      firebaseDevWarned = true;
      console.warn('Firebase no configurado. Modo desarrollo sin autenticación.');
    }
    return null;
  }

  ensureFirebaseConfig();

  const configCompleta = {
    apiKey: firebaseConfig.apiKey,
    projectId: firebaseConfig.projectId || fallbackProjectId,
    authDomain:
      firebaseConfig.authDomain || `${firebaseConfig.projectId || fallbackProjectId}.firebaseapp.com`,
    appId: firebaseConfig.appId,
  };

  if (!firebaseAppInitialized && !getApps().length) {
    firebaseApp = initializeApp(configCompleta as any);
    firebaseAppInitialized = true;
  } else if (!firebaseApp && getApps().length) {
    firebaseApp = getApps()[0];
  }

  const app = firebaseApp ?? getApps()[0];

  if (!app) {
    throw new Error('No se pudo inicializar Firebase App. Revisa la configuración del frontend.');
  }

  return getAuth(app);
}

// Export default para compatibilidad con import existentes
export default getFirebaseAuthClient;
