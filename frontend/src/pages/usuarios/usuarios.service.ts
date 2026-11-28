import type { EstadoUsuario, FiltrosUsuario, Rol, Usuario, UsuarioInput } from './usuarios.types';
import { ROLES_PRUEBA, USUARIOS_PRUEBA } from './usuarios.mock';

export class UsuariosApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'UsuariosApiError';
    this.status = status;
  }
}

let usuarios: Usuario[] = USUARIOS_PRUEBA.map((usuario) => ({ ...usuario }));
let siguienteId = usuarios.length + 1;

const esperar = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export const listarRoles = async (): Promise<Rol[]> => {
  await esperar(150);
  return ROLES_PRUEBA;
};

export const listarUsuarios = async (filtros: FiltrosUsuario = {}): Promise<Usuario[]> => {
  await esperar();
  const buscar = filtros.buscar?.trim().toLowerCase() ?? '';
  return usuarios.filter((usuario) => {
    const coincideBusqueda =
      !buscar ||
      usuario.nombre_completo.toLowerCase().includes(buscar) ||
      usuario.email.toLowerCase().includes(buscar);
    const coincideEstado = !filtros.estado || usuario.estado === filtros.estado;
    return coincideBusqueda && coincideEstado;
  });
};

export const crearUsuario = async (datos: UsuarioInput): Promise<Usuario> => {
  await esperar();
  if (!datos.nombre_completo.trim() || !datos.email.trim() || !datos.password || !datos.id_rol) {
    throw new UsuariosApiError('Todos los campos son obligatorios.', 400);
  }
  const existente = usuarios.find((usuario) => usuario.email.toLowerCase() === datos.email.toLowerCase());
  if (existente) {
    throw new UsuariosApiError('Ya existe un usuario registrado con ese correo electrónico.', 409);
  }
  const nuevo: Usuario = {
    id_usuario: siguienteId++,
    nombre_completo: datos.nombre_completo.trim(),
    email: datos.email.trim(),
    id_rol: datos.id_rol,
    estado: 'Activo',
    fecha_creacion: new Date().toISOString().slice(0, 10),
  };
  usuarios = [nuevo, ...usuarios];
  return nuevo;
};

export const editarUsuario = async (id: number, datos: UsuarioInput): Promise<Usuario> => {
  await esperar();
  if (!datos.nombre_completo.trim() || !datos.email.trim() || !datos.id_rol) {
    throw new UsuariosApiError('Todos los campos son obligatorios.', 400);
  }
  const duplicado = usuarios.find(
    (usuario) => usuario.id_usuario !== id && usuario.email.toLowerCase() === datos.email.toLowerCase(),
  );
  if (duplicado) {
    throw new UsuariosApiError('Ya existe un usuario registrado con ese correo electrónico.', 409);
  }
  const actual = usuarios.find((usuario) => usuario.id_usuario === id);
  if (!actual) {
    throw new UsuariosApiError('El usuario no existe.', 400);
  }
  const actualizado: Usuario = {
    ...actual,
    nombre_completo: datos.nombre_completo.trim(),
    email: datos.email.trim(),
    id_rol: datos.id_rol,
  };
  usuarios = usuarios.map((usuario) => (usuario.id_usuario === id ? actualizado : usuario));
  return actualizado;
};

export const cambiarEstadoUsuario = async (id: number, estado: EstadoUsuario): Promise<Usuario> => {
  await esperar(250);
  const actual = usuarios.find((usuario) => usuario.id_usuario === id);
  if (!actual) {
    throw new UsuariosApiError('El usuario no existe.', 400);
  }
  const actualizado: Usuario = { ...actual, estado };
  usuarios = usuarios.map((usuario) => (usuario.id_usuario === id ? actualizado : usuario));
  return actualizado;
};
