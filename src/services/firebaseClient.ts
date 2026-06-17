import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const fallbackProjectId = 'catastrofescl-dev';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackProjectId,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackProjectId}.firebaseapp.com`,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | null = null;
let firebaseAppInitialized = false;
let firebaseDevWarned = false;

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
      `Falta configurar Firebase en el frontend: ${missingKeys.join(', ')}. Revisa .env.local.`
    );
  }
}

export function getFirebaseAuthClient() {
  // En modo desarrollo, si no hay credenciales, retornar null
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_api_key_here') {
    if (!firebaseDevWarned) {
      firebaseDevWarned = true;
      console.warn('Firebase no configurado. Modo desarrollo sin autenticación.');
    }
    return null;
  }

  ensureFirebaseConfig();

  if (!firebaseAppInitialized && !getApps().length) {
    firebaseApp = initializeApp(firebaseConfig as any);
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
