import { isAxiosError } from 'axios';

/** Mensaje legible a partir de errores Axios (RFC 7807) u otros. */
export function formatApiError(error: unknown): string {
  if (error instanceof Error && !isAxiosError(error)) {
    return error.message;
  }

  if (isAxiosError(error)) {
    if (!error.response) {
      return (
        'No se pudo conectar con el servidor. Verifica que el API Gateway esté activo ' +
        `(NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}).`
      );
    }

    const { status, data } = error.response;

    if (typeof data === 'object' && data !== null) {
      const problem = data as { detail?: string; title?: string; message?: string };
      if (problem.detail?.trim()) return problem.detail;
      if (problem.title?.trim()) return problem.title;
      if (problem.message?.trim()) return problem.message;
    }

    if (typeof data === 'string' && data.trim()) return data;

    if (status === 401) {
      return 'Sesión expirada o token inválido. Cierra sesión e inicia de nuevo.';
    }
    if (status === 403) {
      return 'No tienes permiso para esta acción (se requiere rol ADMINISTRADOR o AUTORIDAD).';
    }
    if (status === 400) {
      return 'Los datos enviados no son válidos. Revisa región, severidad y la zona dibujada en el mapa.';
    }

    return `Error del servidor (${status}).`;
  }

  return 'Error inesperado al procesar la solicitud.';
}
