import { NextFunction, Request, RequestHandler, Response } from 'express';

const verificarRol = (...rolesPermitidos: Array<string | number>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const usuario: any = (req as any).user || (req as any).usuario;

    if (!usuario) {
      res.status(401).json({
        ok: false,
        message: 'No autenticado'
      });
      return;
    }

    // Soporta todas las variantes que puede mandar el auth.middleware
    const rolActual: string = 
      (typeof usuario.rol === 'string' ? usuario.rol : null) ||
      usuario.nombre_rol ||
      usuario.rol_nombre ||
      usuario.Rol?.nombre_rol ||
      usuario.Rol?.nombre ||
      usuario.rol?.nombre_rol ||
      usuario.rol?.nombre ||
      '';

    const rolId = Number(
      usuario.rol_id ?? 
      usuario.id_rol ?? 
      usuario.rolId ?? 
      usuario.idRol ?? 
      usuario.Rol?.id_rol ??
      usuario.rol?.id_rol
    );

    const tienePermiso = rolesPermitidos.some((rol) => {
      if (typeof rol === 'number') {
        return !isNaN(rolId) && rol === rolId;
      }

      const rolSolicitado = String(rol).toLowerCase().trim();
      const rolUsuario = String(rolActual || '').toLowerCase().trim();

      // Si solo tenemos ID, permitimos 1=admin, 2=contador, 3=auxiliar
      if (!rolUsuario && !isNaN(rolId)) {
        if (rolId === 1 && (rolSolicitado === 'administrador' || rolSolicitado === 'admin')) return true;
        if (rolId === 2 && rolSolicitado === 'contador') return true;
        if (rolId === 3 && rolSolicitado === 'auxiliar contable') return true;
      }

      return rolSolicitado === rolUsuario ||
        (rolSolicitado === 'admin' && rolUsuario === 'administrador') ||
        (rolSolicitado === 'administrador' && rolUsuario === 'admin');
    });

    if (!tienePermiso) {
      console.log('DEBUG ROL -> usuario:', usuario, 'rolActual:', rolActual, 'rolId:', rolId);
      res.status(403).json({
        ok: false,
        message: 'No tienes permiso para esta acción'
      });
      return;
    }

    next();
  };
};

export default verificarRol;