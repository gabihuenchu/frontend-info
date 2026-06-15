import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { getFirebaseAuthClient } from './firebaseClient';

// El frontend debe consumir siempre el API Gateway; este enruta al MS Identity.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function readTokenFromLocalStorage(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return null;
    }
    const parsed = JSON.parse(storedUser) as { token?: string };
    if (parsed?.token && typeof parsed.token === 'string') {
      return parsed.token;
    }
  } catch (e) {
    console.error('Error al parsear usuario de localStorage:', e);
  }
  return null;
}

/**
 * Obtiene el token para Authorization: Bearer (Firebase idToken o el guardado tras login).
 */
export const getFirebaseToken = async (): Promise<string | null> => {
  try {
    const auth = getFirebaseAuthClient();
    if (auth?.currentUser) {
      return await auth.currentUser.getIdToken();
    }

    const fromStorage = readTokenFromLocalStorage();
    if (fromStorage) {
      return fromStorage;
    }

    if (!auth) {
      console.warn(
        'Firebase no está configurado (NEXT_PUBLIC_FIREBASE_*). ' +
          'Configure Firebase o inicie sesión para guardar el token en localStorage.'
      );
      return null;
    }

    console.warn('No hay usuario autenticado (ni en Firebase ni en localStorage)');
    return null;
  } catch (error) {
    console.error('Error al obtener token de Firebase:', error);
    return null;
  }
};

/**
 * Refresca el token de Firebase
 */
export const refreshFirebaseToken = async (): Promise<string | null> => {
  try {
    const auth = getFirebaseAuthClient();
    if (!auth) {
      return null;
    }
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }
    
    // Forzar refresh del token
    const token = await user.getIdToken(true);
    return token;
  } catch (error) {
    console.error('Error al refrescar token:', error);
    return null;
  }
};

// Interceptor para agregar token de Firebase en cada request
apiClient.interceptors.request.use(
  async (config) => {
    // Registro/login sin token: si axios envía un Bearer viejo/inválido, ms-identity
    // puede responder 401 antes de llegar al controlador (FirebaseTokenFilter).
    const path = config.url ?? '';
    const isPublicAuth =
      path.includes('/auth/register') ||
      path.includes('/auth/login') ||
      path.includes('/auth/invitacion/aceptar');
    if (isPublicAuth) {
      return config;
    }

    const token = await getFirebaseToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores y refresh de token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (Unauthorized) y no hemos intentado refrescar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar refrescar el token
        const newToken = await refreshFirebaseToken();
        
        if (newToken) {
          // Actualizar el header y reintentar la petición
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error al refrescar token:', refreshError);
      }
    }
    
    // Manejar errores específicos del backend (RFC 7807) y mejorar logging
    if (error.response) {
      const resp = error.response;
      let parsedData: string | object = resp.data;

      try {
        // Intentar normalizar a objeto si es JSON en string
        if (typeof resp.data === 'string') {
          parsedData = JSON.parse(resp.data);
        }
      } catch {
        // no hacer nada si no es JSON
      }

      const problem = parsedData as {
        title?: string;
        detail?: string;
        errorCode?: string;
        instance?: string;
      } | null;

      const safeData =
        problem?.detail || problem?.title
          ? {
              status: resp.status,
              title: problem.title,
              detail: problem.detail,
              errorCode: problem.errorCode,
              instance: problem.instance,
            }
          : parsedData && Object.keys(parsedData as object).length > 0
            ? parsedData
            : typeof resp.data === 'string'
              ? resp.data
              : JSON.stringify(resp.data);

      console.error('Error del backend:', safeData);
    } else if (error.request) {
      // El request fue enviado pero no hubo respuesta (Network Error, CORS, timeout...)
      console.error('No response from backend (possible network error or CORS):', {
        message: error.message,
        request: error.request && (error.request._header || error.request)
      });
    } else {
      // Error al configurar la petición
      console.error('Axios error (request setup):', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
