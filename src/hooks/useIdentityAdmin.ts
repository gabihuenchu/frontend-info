import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignRoleToUser,
  changeUserStatus,
  getAllUsers,
  getUsuarioById,
  removeRoleFromUser,
} from '@/services/usuario.service';
import {
  assignPermissionToRole,
  getAllRoles,
  getRoleById,
  removePermissionFromRole,
} from '@/services/rol.service';
import { getAllPermissions } from '@/services/permiso.service';
import type { AssignRoleRequest, ChangeStatusRequest } from '@/types/identity';

export const IDENTITY_KEYS = {
  usuarios: ['identity', 'usuarios'] as const,
  usuario: (id: string) => ['identity', 'usuario', id] as const,
  roles: ['identity', 'roles'] as const,
  rol: (id: string) => ['identity', 'rol', id] as const,
  permisos: ['identity', 'permisos'] as const,
};

export const useUsuarios = () =>
  useQuery({
    queryKey: IDENTITY_KEYS.usuarios,
    queryFn: getAllUsers,
    staleTime: 30_000,
  });

export const useUsuario = (id: string | null) =>
  useQuery({
    queryKey: IDENTITY_KEYS.usuario(id ?? ''),
    queryFn: () => getUsuarioById(id!),
    enabled: Boolean(id),
  });

export const useRoles = () =>
  useQuery({
    queryKey: IDENTITY_KEYS.roles,
    queryFn: getAllRoles,
    staleTime: 30_000,
  });

export const useRol = (id: string | null) =>
  useQuery({
    queryKey: IDENTITY_KEYS.rol(id ?? ''),
    queryFn: () => getRoleById(id!),
    enabled: Boolean(id),
    staleTime: 15_000,
  });

export const usePermisos = () =>
  useQuery({
    queryKey: IDENTITY_KEYS.permisos,
    queryFn: getAllPermissions,
    staleTime: 60_000,
  });

export const useAssignRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AssignRoleRequest }) =>
      assignRoleToUser(userId, data),
    onSuccess: (_d, { userId, data }) => {
      qc.invalidateQueries({ queryKey: IDENTITY_KEYS.usuarios });
      qc.invalidateQueries({ queryKey: IDENTITY_KEYS.usuario(userId) });
      qc.invalidateQueries({ queryKey: IDENTITY_KEYS.rol(data.rolId) });
    },
  });
};

export const useRemoveRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, rolId }: { userId: string; rolId: string }) =>
      removeRoleFromUser(userId, rolId),
    onSuccess: (_d, { userId, rolId }) => {
      qc.invalidateQueries({ queryKey: IDENTITY_KEYS.usuarios });
      qc.invalidateQueries({ queryKey: IDENTITY_KEYS.usuario(userId) });
      qc.invalidateQueries({ queryKey: IDENTITY_KEYS.rol(rolId) });
    },
  });
};

export const useChangeUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: ChangeStatusRequest }) =>
      changeUserStatus(userId, data),
    onSuccess: (_d, { userId }) => {
      qc.invalidateQueries({ queryKey: IDENTITY_KEYS.usuarios });
      qc.invalidateQueries({ queryKey: IDENTITY_KEYS.usuario(userId) });
    },
  });
};

export const useToggleRolePermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      rolId,
      permisoId,
      asignar,
    }: {
      rolId: string;
      permisoId: string;
      asignar: boolean;
    }) => {
      if (asignar) {
        await assignPermissionToRole(rolId, permisoId);
      } else {
        await removePermissionFromRole(rolId, permisoId);
      }
    },
    onSuccess: (_d, { rolId }) => {
      qc.invalidateQueries({ queryKey: IDENTITY_KEYS.roles });
      qc.invalidateQueries({ queryKey: IDENTITY_KEYS.rol(rolId) });
      qc.invalidateQueries({ queryKey: IDENTITY_KEYS.usuarios });
    },
  });
};
