import axios from 'axios';
import apiClient from './apiClient';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { getFirebaseAuthClient } from './firebaseClient';

/**
 * Cliente HTTP sin interceptors para POST /auth/register.
 * Evita cualquier Authorization residual y el reintento 401 del apiClient,
 * que en flujos de registro pueden dejar inconsistencias difíciles de depurar.
 */
const registerHttp = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export interface RegisterRequest {
  correo: string;
  password: string;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  tipoDocumento: string;
  telefono?: string;
  pais?: string;
}

export interface RegistroFirebaseRequest {
  correo: string;
  password: string;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  tipoDocumento: string;
  telefono?: string;
  pais?: string;
}

export interface SyncFirebaseRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  numeroDocumento: string;
  tipoDocumento: string;
  telefono?: string;
  pais?: string;
}

export interface SyncSystemRequest {
  firebaseUid: string;
  nombres: string;
  apellidos: string;
  correo: string;
  numeroDocumento: string;
  tipoDocumento: string;
}

export interface InvitationRequest {
  correo: string;
}

export interface AcceptInvitationRequest {
  token: string;
}

export interface LoginResponse {
  token: string;
  profile: unknown;
  email: string;
}

export interface RegisterResponse {
  profile: unknown;
  email: string;
}

export const AuthService = {
  /**
   * Registro unificado: el backend (ms-identity) crea el usuario en Firebase Auth
   * Admin SDK y lo persiste en PostgreSQL en la misma petición.
   * Evita el flujo anterior (createUser + sync) donde un Bearer mal inyectado daba 401
   * y dejaba usuarios solo en Firebase.
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const registroPayload: RegistroFirebaseRequest = {
      correo: data.correo.trim(),
      password: data.password,
      nombres: data.nombres.trim(),
      apellidos: data.apellidos.trim(),
      tipoDocumento: data.tipoDocumento.trim(),
      numeroDocumento: data.numeroDocumento?.trim(),
      telefono: data.telefono?.trim(),
      pais: data.pais,
    };

    try {
      const response = await registerHttp.post('/auth/register', registroPayload);

      return {
        profile: response.data,
        email: data.correo,
      };
    } catch (error) {
      console.error('Error en registro (backend):', error);
      throw error;
    }
  },

  /** @deprecated Usar register() que llama POST /auth/register; se mantiene por compatibilidad */
  registerLegacyClientFirebase: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const auth = getFirebaseAuthClient();
    if (!auth) {
      throw new Error('Firebase Auth no está configurado. Revisa las variables NEXT_PUBLIC_FIREBASE_* en .env.local.');
    }

    const credentials = await createUserWithEmailAndPassword(
      auth,
      data.correo.trim(),
      data.password
    );

    try {
      const registroPayload: RegistroFirebaseRequest = {
        correo: data.correo,
        password: data.password,
        nombres: data.nombres,
        apellidos: data.apellidos,
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        telefono: data.telefono,
        pais: data.pais,
      };

      const token = await credentials.user.getIdToken();

      try {
        console.log('DEBUG: idToken (first 32 chars):', token?.substring(0, 32));
        console.log('DEBUG: registroPayload', registroPayload);
      } catch (e) {
        // no romper en producción si console falla
      }

      const syncResponse = await AuthService.syncFirebase({
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo: data.correo,
        numeroDocumento: data.numeroDocumento,
        tipoDocumento: data.tipoDocumento,
        telefono: data.telefono,
        pais: data.pais,
      }, token);

      await signOut(auth);

      return {
        profile: syncResponse,
        email: credentials.user.email || data.correo,
      };
    } catch (error) {
      try {
        await deleteUser(credentials.user);
      } catch {
        // Si el rollback falla, priorizamos propagar el error original.
      }
      throw error;
    }
  },

  // 2. Sincronizar Usuario Firebase
  syncFirebase: async (data: SyncFirebaseRequest, token: string) => {
    const response = await apiClient.post('/auth/firebase/sync', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 3. Sincronizar Usuario (Sistema)
  syncSystem: async (data: SyncSystemRequest, syncSecret: string) => {
    const response = await apiClient.post('/auth/firebase/sync/system', data, {
      headers: { 'X-Sync-Secret': syncSecret }
    });
    return response.data;
  },

  // 4. Generar Invitación para Operador
  generarInvitacion: async (data: InvitationRequest, token: string) => {
    const response = await apiClient.post('/auth/invitacion/operador', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 5. Aceptar Invitación
  aceptarInvitacion: async (data: AcceptInvitationRequest, token: string) => {
    const response = await apiClient.post('/auth/invitacion/aceptar', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 6. Login real con Firebase Auth + validación del perfil contra el Gateway.
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const auth = getFirebaseAuthClient();
    if (!auth) {
      throw new Error('Firebase Auth no está configurado. Revisa las variables NEXT_PUBLIC_FIREBASE_* en .env.local.');
    }
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    const token = await credentials.user.getIdToken();
    const authHeaders = { Authorization: `Bearer ${token}` };

    // ms-identity auto-provisiona en BD al validar el Bearer (FirebaseTokenFilter).
    const profileResponse = await apiClient.get('/usuarios/yo', { headers: authHeaders });
    return {
      token,
      profile: profileResponse.data,
      email: credentials.user.email || email,
    };
  }
};
