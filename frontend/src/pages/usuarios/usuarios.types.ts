export type EstadoUsuario = 'Activo' | 'Inactivo';

export interface Rol {
  id_rol: number;
  nombre_rol: string;
}

export interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  id_rol: number;
  estado: EstadoUsuario;
  fecha_creacion: string;
}

export interface UsuarioInput {
  nombre_completo: string;
  email: string;
  password?: string;
  id_rol: number;
}

export interface FiltrosUsuario {
  buscar?: string;
  estado?: EstadoUsuario | '';
}
