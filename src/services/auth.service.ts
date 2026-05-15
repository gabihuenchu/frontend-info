import apiClient from './apiClient';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { getFirebaseAuthClient } from './firebaseClient';

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
  // 1. Registrar cuenta en Firebase y sincronizar perfil en backend.
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
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

      // Obtener el token del usuario creado en Firebase
      const token = await credentials.user.getIdToken();

      // DEBUG: mostrar token corto y payload para depuración local
      try {
        console.log('DEBUG: idToken (first 32 chars):', token?.substring(0, 32));
        console.log('DEBUG: registroPayload', registroPayload);
      } catch (e) {
        // no romper en producción si console falla
      }

      // Sincronizar el perfil en el backend usando el endpoint autenticado
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

    const profileResponse = await apiClient.get('/usuarios/yo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      token,
      profile: profileResponse.data,
      email: credentials.user.email || email,
    };
  }
};
