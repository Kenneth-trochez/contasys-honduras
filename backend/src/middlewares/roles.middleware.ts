
import { NextFunction, Request, RequestHandler, Response } from 'express';

const verificarRol = (
  ...rolesPermitidos: Array<string | number>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const usuario = req.user || req.usuario;

    if (!usuario) {
      res.status(401).json({
        ok: false,
        message: 'No autenticado',
      });
      return;
    }

    const rolActual = String(
      (usuario as any).rol ?? ''
    ).toLowerCase().trim();

    const rolId = Number((usuario as any).id_rol);

    const tienePermiso = rolesPermitidos.some((rol) => {
      if (typeof rol === 'number') {
        return Number.isFinite(rolId) && rol === rolId;
      }

      const rolSolicitado = rol.toLowerCase().trim();

      return (
        rolSolicitado === rolActual ||
        (rolSolicitado === 'admin' && rolActual === 'administrador')
      );
    });

    if (!tienePermiso) {
      res.status(403).json({
        ok: false,
        message: 'No tienes permiso para esta acción',
      });
      return;
    }

    next();
  };
};

export default verificarRol;
