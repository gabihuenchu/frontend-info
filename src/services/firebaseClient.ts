import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const fallbackProjectId = 'catastrofescl-dev';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackProjectId,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackProjectId}.firebaseapp.com`,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseAppInitialized = false;

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
  ensureFirebaseConfig();

  if (!firebaseAppInitialized && !getApps().length) {
    initializeApp(firebaseConfig as any);
    firebaseAppInitialized = true;
  }

  return getAuth();
}