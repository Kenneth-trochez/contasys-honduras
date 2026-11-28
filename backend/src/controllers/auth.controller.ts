import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { randomInt } from 'crypto';

import {
  Usuario,
  Rol,
  TokenRecuperacion,
} from '../models';

import { UsuarioToken } from '../types/express';
import { enviarCorreo } from '../services/correo.service';

// ======================================================
// INICIAR SESIÓN
// ======================================================

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const correo = email || req.body.correo;

    if (!correo || !password) {
      res.status(400).json({
        ok: false,
        message: 'Email y password son requeridos',
      });
      return;
    }

    const usuario = await Usuario.findOne({
      where: { email: correo },
      include: [{ model: Rol, as: 'rol' }],
    });

    if (!usuario) {
      res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas',
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
        message: 'Credenciales inválidas',
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
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

// ======================================================
// DATOS DEL USUARIO AUTENTICADO
// ======================================================

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

// ======================================================
// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ======================================================

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!email) {
      res.status(400).json({
        ok: false,
        message: 'El correo electrónico es obligatorio',
      });
      return;
    }

    const respuesta = {
      ok: true,
      message: 'Si el correo está registrado, recibirás un PIN de recuperación.',
    };

    const usuario = await Usuario.findOne({
      where: { email },
    });

    // No revelar si el correo existe.
    if (!usuario || usuario.estado === 'Inactivo') {
      res.status(200).json(respuesta);
      return;
    }

    // Invalidar solicitudes anteriores.
    await TokenRecuperacion.update(
      { usado: true },
      {
        where: {
          id_usuario: usuario.id_usuario,
          usado: false,
        },
      }
    );

    // PIN aleatorio de seis dígitos.
    const pin = randomInt(100000, 1000000).toString();

    // Guardar solamente el hash del PIN.
    const pinHash = await bcrypt.hash(pin, 10);

    const fechaExpiracion = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const registro = await TokenRecuperacion.create({
      id_usuario: usuario.id_usuario,
      token: pinHash,
      fecha_expiracion: fechaExpiracion,
      usado: false,
      intentos: 0,
    });

    try {
      await enviarCorreo({
        para: usuario.email,
        asunto: 'Recuperación de contraseña - ContaSys',
        texto:
          `Hola ${usuario.nombre_completo}.\n\n` +
          `Tu PIN de recuperación es: ${pin}\n\n` +
          'Este PIN vence en 10 minutos y solo puede utilizarse una vez.\n\n' +
          'Si no solicitaste este cambio, ignora este correo.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
            <h2>Recuperación de contraseña</h2>
            <p>Hola ${usuario.nombre_completo},</p>
            <p>Tu PIN de recuperación de ContaSys es:</p>
            <h1 style="letter-spacing: 8px; text-align: center;">
              ${pin}
            </h1>
            <p>Este código vence en 10 minutos.</p>
            <p>Si no solicitaste este cambio, ignora este correo.</p>
          </div>
        `,
      });
    } catch (error) {
      await registro.update({ usado: true });
      throw error;
    }

    res.status(200).json(respuesta);
  } catch (error) {
    console.error('Error solicitando recuperación:', error);

    res.status(500).json({
      ok: false,
      message: 'No se pudo procesar la solicitud de recuperación',
    });
  }
};

// ======================================================
// VERIFICAR PIN Y CAMBIAR CONTRASEÑA
// ======================================================

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const pin = String(req.body.pin || '').trim();
    const nuevaPassword = String(req.body.newPassword || '');

    if (!email || !pin || !nuevaPassword) {
      res.status(400).json({
        ok: false,
        message: 'Correo, PIN y nueva contraseña son obligatorios',
      });
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      res.status(400).json({
        ok: false,
        message: 'El PIN debe contener exactamente seis dígitos',
      });
      return;
    }

    if (nuevaPassword.length < 8) {
      res.status(400).json({
        ok: false,
        message: 'La contraseña debe tener al menos 8 caracteres',
      });
      return;
    }

    const usuario = await Usuario.findOne({
      where: { email },
    });

    if (!usuario || usuario.estado === 'Inactivo') {
      res.status(400).json({
        ok: false,
        message: 'PIN inválido o expirado',
      });
      return;
    }

    const registro = await TokenRecuperacion.findOne({
      where: {
        id_usuario: usuario.id_usuario,
        usado: false,
      },
      order: [['id_token', 'DESC']],
    });

    if (!registro) {
      res.status(400).json({
        ok: false,
        message: 'PIN inválido o expirado',
      });
      return;
    }

    if (registro.fecha_expiracion.getTime() <= Date.now()) {
      await registro.update({ usado: true });

      res.status(400).json({
        ok: false,
        message: 'El PIN ha expirado. Solicita uno nuevo.',
      });
      return;
    }

    if (registro.intentos >= 5) {
      await registro.update({ usado: true });

      res.status(400).json({
        ok: false,
        message: 'Se agotaron los intentos. Solicita un nuevo PIN.',
      });
      return;
    }

    const pinValido = await bcrypt.compare(
      pin,
      registro.token
    );

    if (!pinValido) {
      const nuevosIntentos = registro.intentos + 1;

      await registro.update({
        intentos: nuevosIntentos,
        usado: nuevosIntentos >= 5,
      });

      res.status(400).json({
        ok: false,
        message:
          nuevosIntentos >= 5
            ? 'Se agotaron los intentos. Solicita un nuevo PIN.'
            : 'PIN incorrecto',
        intentosRestantes: Math.max(0, 5 - nuevosIntentos),
      });
      return;
    }

    // Actualizar contraseña.
    const passwordHash = await bcrypt.hash(
      nuevaPassword,
      10
    );

    await usuario.update({
      password_hash: passwordHash,
    });

    // Invalidar el PIN utilizado.
    await registro.update({
      usado: true,
    });

    res.status(200).json({
      ok: true,
      message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
    });
  } catch (error) {
    console.error('Error restableciendo contraseña:', error);

    res.status(500).json({
      ok: false,
      message: 'Error interno al restablecer la contraseña',
    });
  }
};