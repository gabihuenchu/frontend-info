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

/**
 * Obtiene el token de Firebase del usuario actual
 */
export const getFirebaseToken = async (): Promise<string | null> => {
  try {
    const auth = getFirebaseAuthClient();
    if (!auth) {
      console.warn('Firebase no inicializado');
      return null;
    }
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('No hay usuario autenticado');
      return null;
    }
    
    const token = await user.getIdToken();
    return token;
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
    
    // Manejar errores específicos del backend (RFC 7807)
    if (error.response?.data) {
      const errorData = error.response.data;
      console.error('Error del backend:', {
        type: errorData.type,
        title: errorData.title,
        status: errorData.status,
        detail: errorData.detail,
        errorCode: errorData.errorCode,
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
