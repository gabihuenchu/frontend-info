import axios from 'axios';

// El frontend debe consumir siempre el API Gateway; este enruta al MS Identity.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token si existe
apiClient.interceptors.request.use(
  (config) => {
    // Aquí iría la lógica para obtener el token de Firebase
    // const token = await getFirebaseToken();
    // si existe: config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
