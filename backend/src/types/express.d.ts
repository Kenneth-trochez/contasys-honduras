// Datos que el middleware de autenticación agrega al request.
export interface UsuarioToken {
  id: number;
  id_rol: number;
  iat?: number;
  exp?: number;
  // Campos opcionales que revisa el middleware de roles.
  rol?: string | { nombre?: string };
  Rol?: { nombre?: string };
  rol_nombre?: string;
  rol_id?: number | string;
}

declare global {
  namespace Express {
    interface Request {
      // auth.middleware guarda aquí el contenido del token.
      user?: UsuarioToken;
      // Algunos módulos todavía leen req.usuario; se deja tipado para no romperlos.
      usuario?: UsuarioToken;
    }
  }
}

export {};
