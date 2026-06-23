import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const crearNecesidad = vi.fn();

vi.mock('@/services/citizen.service', () => ({
  crearNecesidad: (...args: unknown[]) => crearNecesidad(...args),
}));

import { useCreateNeed } from './useNeeds';
import { CITIZEN_QUERY_KEYS } from './usePublicNeeds';
import type { CrearNecesidadRequest } from '@/types/citizen';

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

const solicitud: CrearNecesidadRequest = {
  centroId: 'centro-1',
  itemId: 'item-1',
  cantidadNecesaria: 5,
  prioridad: 'ALTO',
};

describe('useCreateNeed', () => {
  beforeEach(() => {
    crearNecesidad.mockReset();
  });

  it('invoca crearNecesidad con los datos de la mutación', async () => {
    crearNecesidad.mockResolvedValue({ id: 'n1' });
    const { wrapper } = crearWrapper();

    const { result } = renderHook(() => useCreateNeed(), { wrapper });
    result.current.mutate(solicitud);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(crearNecesidad).toHaveBeenCalledWith(solicitud);
  });

  it('invalida las query keys relacionadas en onSuccess', async () => {
    crearNecesidad.mockResolvedValue({ id: 'n1' });
    const { queryClient, wrapper } = crearWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateNeed(), { wrapper });
    result.current.mutate(solicitud);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['necesidades'] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: CITIZEN_QUERY_KEYS.centerNeeds(solicitud.centroId),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: CITIZEN_QUERY_KEYS.donationQuotas(solicitud.centroId),
    });
  });

  it('expone el estado de error cuando la mutación falla', async () => {
    crearNecesidad.mockRejectedValue(new Error('falló'));
    const { wrapper } = crearWrapper();

    const { result } = renderHook(() => useCreateNeed(), { wrapper });
    result.current.mutate(solicitud);

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
