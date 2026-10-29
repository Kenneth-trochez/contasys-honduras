
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Usuario, Rol } from '../models';
import { UsuarioToken } from '../types/express';

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        ok: false,
        message: 'Email y password son requeridos',
      });
      return;
    }

    const usuario = await Usuario.findOne({
      where: { email },
      include: [{ model: Rol, as: 'rol' }],
    });

    if (!usuario) {
      res.status(404).json({
        ok: false,
        message: 'Usuario no existe',
      });
      return;
    }

    if (usuario.estado === 'Inactivo') {
      res.status(403).json({
        ok: false,
        message: 'Usuario inactivo',
      });
      return;
    }

    const valid = await bcrypt.compare(
      password,
      usuario.password_hash
    );

    if (!valid) {
      res.status(401).json({
        ok: false,
        message: 'Password incorrecta',
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error('Falta configurar JWT_SECRET');

      res.status(500).json({
        ok: false,
        message: 'Error de configuración del servidor',
      });
      return;
    }

    const expiresIn = (
      process.env.JWT_EXPIRES_IN || '8h'
    ) as SignOptions['expiresIn'];

    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        id_rol: usuario.id_rol,
      },
      secret,
      { expiresIn }
    );

    const rol = usuario.get('rol') as Rol | undefined;

    res.status(200).json({
      ok: true,
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);

    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
};

export const me = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const usuarioToken = req.user as UsuarioToken | undefined;

    if (!usuarioToken?.id) {
      res.status(401).json({
        ok: false,
        message: 'Usuario no autenticado',
      });
      return;
    }

    const usuario = await Usuario.findByPk(
      usuarioToken.id,
      {
        attributes: [
          'id_usuario',
          'nombre_completo',
          'email',
          'id_rol',
          'estado',
        ],
        include: [{ model: Rol, as: 'rol' }],
      }
    );

    if (!usuario || usuario.estado === 'Inactivo') {
      res.status(401).json({
        ok: false,
        message: 'Usuario no encontrado o inactivo',
      });
      return;
    }

    res.status(200).json({
      ok: true,
      usuario,
    });
  } catch (error) {
    console.error('Error obteniendo usuario autenticado:', error);

    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
};
