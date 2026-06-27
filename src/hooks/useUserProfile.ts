/**
 * useUserProfile.ts
 * Perfil del usuario autenticado (roles + permisos) cacheado con TanStack Query.
 * Reutilizable para gatear acciones en la UI sin volver a pedir el token en cada componente.
 */

import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '@/services/usuario.service';
import { useAuth } from '@/providers/AuthProvider';
import type { UsuarioResponse } from '@/types/identity';

export const useUserProfile = () => {
  const { user } = useAuth();
  return useQuery<UsuarioResponse>({
    queryKey: ['usuario', 'yo', user?.uid ?? 'anon'],
    queryFn: getMyProfile,
    enabled: Boolean(user),
    staleTime: 5 * 60_000,
    retry: 1,
  });
};
