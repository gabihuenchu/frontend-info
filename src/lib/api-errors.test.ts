import { describe, it, expect } from 'vitest';
import { AxiosError, type AxiosResponse } from 'axios';
import { formatApiError } from './api-errors';

function axiosErrorConRespuesta(status: number, data: unknown): AxiosError {
  const error = new AxiosError('Request failed', 'ERR_BAD_RESPONSE');
  error.response = { status, data, statusText: '', headers: {}, config: {} } as AxiosResponse;
  return error;
}

describe('formatApiError', () => {
  it('devuelve el mensaje de un Error genérico (no Axios)', () => {
    expect(formatApiError(new Error('Algo falló'))).toBe('Algo falló');
  });

  it('devuelve mensaje inesperado para valores desconocidos', () => {
    expect(formatApiError('texto suelto')).toBe('Error inesperado al procesar la solicitud.');
    expect(formatApiError(null)).toBe('Error inesperado al procesar la solicitud.');
  });

  it('prioriza el campo detail de un Problem Details (RFC 7807)', () => {
    const error = axiosErrorConRespuesta(422, {
      title: 'Validación',
      detail: 'El RUT ingresado no es válido.',
    });
    expect(formatApiError(error)).toBe('El RUT ingresado no es válido.');
  });

  it('usa title cuando no hay detail', () => {
    const error = axiosErrorConRespuesta(422, { title: 'Datos inválidos' });
    expect(formatApiError(error)).toBe('Datos inválidos');
  });

  it('usa message cuando no hay detail ni title', () => {
    const error = axiosErrorConRespuesta(500, { message: 'Boom' });
    expect(formatApiError(error)).toBe('Boom');
  });

  it('devuelve la data si es un string no vacío', () => {
    const error = axiosErrorConRespuesta(500, 'Error plano');
    expect(formatApiError(error)).toBe('Error plano');
  });

  it('mensaje específico para 401', () => {
    const error = axiosErrorConRespuesta(401, {});
    expect(formatApiError(error)).toContain('Sesión expirada');
  });

  it('mensaje específico para 403', () => {
    const error = axiosErrorConRespuesta(403, {});
    expect(formatApiError(error)).toContain('No tienes permiso');
  });

  it('mensaje específico para 400', () => {
    const error = axiosErrorConRespuesta(400, {});
    expect(formatApiError(error)).toContain('no son válidos');
  });

  it('mensaje genérico de servidor para otros status', () => {
    const error = axiosErrorConRespuesta(503, {});
    expect(formatApiError(error)).toBe('Error del servidor (503).');
  });

  it('mensaje de conexión cuando no hay respuesta (network error)', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK');
    expect(formatApiError(error)).toContain('No se pudo conectar con el servidor');
  });
});
