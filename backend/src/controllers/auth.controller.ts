import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Usuario, Rol } from '../models';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ ok: false, message: 'Email y password son requeridos' });
      return;
    }

    const usuario = await Usuario.findOne({
      where: { email },
      include: [{ model: Rol, as: 'rol' }]
    });

    if (!usuario) {
      res.status(404).json({ ok: false, message: "Usuario no existe" });
      return;
    }
    if (usuario.estado === 'Inactivo') {
      res.status(403).json({ ok: false, message: "Usuario inactivo" });
      return;
    }

    const valid = await bcrypt.compare(password, usuario.password_hash);
    if (!valid) {
      res.status(401).json({ ok: false, message: "Password incorrecta" });
      return;
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, id_rol: usuario.id_rol },
      process.env.JWT_SECRET || 'contasys_secret_2024',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as SignOptions['expiresIn'] }
    );

    const rol = usuario.get('rol') as Rol | undefined;
    res.json({ ok: true, token, usuario: { id_usuario: usuario.id_usuario, nombre_completo: usuario.nombre_completo, email: usuario.email, rol } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : String(error) });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  // auth.middleware siempre corre antes de esta ruta y llena req.user.
  const usuario = await Usuario.findByPk(req.user!.id, { attributes: ['id_usuario', 'nombre_completo', 'email', 'id_rol', 'estado'], include: [{ model: Rol, as: 'rol' }] });
  res.json({ ok: true, usuario });
};
