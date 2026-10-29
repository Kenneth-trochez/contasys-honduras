
import type { RequestHandler } from 'express';
import passport from '../config/passport';
import type { UsuarioToken } from '../types/express';

const authMiddleware: RequestHandler = (req, res, next) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (error: unknown, user: Express.User | false) => {
      if (error) {
        return next(error);
      }

      if (!user) {
        return res.status(401).json({
          ok: false,
          message: 'Token inválido, expirado o usuario inactivo',
        });
      }

      const usuarioToken = user as UsuarioToken;

      req.user = usuarioToken;
      req.usuario = usuarioToken;

      return next();
    }
  )(req, res, next);
};

export default authMiddleware;
