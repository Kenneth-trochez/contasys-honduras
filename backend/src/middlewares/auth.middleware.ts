import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioToken } from '../types/express';

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header) {
    res.status(401).json({ ok: false, message: "Token inválido - falta Bearer" });
    return;
  }

  const token = header.split(' ')[1];
  if (!token) {
    res.status(401).json({ ok: false, message: "Token inválido" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'contasys_secret_2024');
    req.user = decoded as UsuarioToken;
    next();
  } catch (err) {
    if (err instanceof Error && err.name === 'TokenExpiredError') {
      res.status(401).json({ ok: false, message: "Token expirado" });
      return;
    }
    res.status(401).json({ ok: false, message: "Token inválido" });
  }
};

export default authMiddleware;
