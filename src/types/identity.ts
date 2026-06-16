export type EstadoUsuario = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';

export interface UsuarioResponse {
  id: string;
  firebaseUid: string;
  correo: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  estado: EstadoUsuario | string;
  roles: string[];
  permisos: string[];
}

export interface PermisoResponse {
  id: string;
  codigo: string;
  descripcion: string;
  modulo: string;
  activo: boolean;
}

export interface RolResponse {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  permisos: string[];
}

export interface AssignRoleRequest {
  rolId: string;
}

export interface ChangeStatusRequest {
  estado: EstadoUsuario;
}
