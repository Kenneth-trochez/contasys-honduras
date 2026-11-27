import client from './client';

export interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  rol: { id_rol: number; nombre_rol: string } | null;
}

export interface LoginResponse {
  ok: boolean;
  token: string;
  usuario: Usuario;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const login = (data: LoginCredentials): Promise<LoginResponse> =>
  client.post('/auth/login', data).then((r) => r.data);
