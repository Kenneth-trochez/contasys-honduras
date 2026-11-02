import nodemailer, { Transporter } from 'nodemailer';
import ErrorNegocio from '../utils/errorNegocio';

export interface OpcionesCorreo {
  para: string | string[];
  asunto: string;
  texto?: string;
  html?: string;
}

let transporter: Transporter | null = null;

const variableRequerida = (nombre: string): string => {
  const valor = process.env[nombre];
  if (!valor) {
    throw new ErrorNegocio(500, `Configuración de correo incompleta: falta ${nombre}`);
  }
  return valor;
};

// El transporter se crea una sola vez, con la configuración leída del entorno.
const obtenerTransporter = (): Transporter => {
  if (!transporter) {
    const puerto = Number(process.env.MAIL_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: variableRequerida('MAIL_HOST'),
      port: puerto,
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: variableRequerida('MAIL_USER'),
        pass: variableRequerida('MAIL_PASSWORD'),
      },
    });
  }
  return transporter;
};

export const enviarCorreo = async ({ para, asunto, texto, html }: OpcionesCorreo): Promise<void> => {
  if (!texto && !html) {
    throw new ErrorNegocio(400, 'El correo requiere texto o html');
  }

  const transport = obtenerTransporter();
  const remitente = process.env.MAIL_FROM || variableRequerida('MAIL_USER');

  try {
    await transport.sendMail({ from: remitente, to: para, subject: asunto, text: texto, html });
  } catch (error) {
    // Se registra solo el código del error: el mensaje original puede incluir usuario o servidor.
    const codigo = (error as { code?: string }).code ?? 'DESCONOCIDO';
    console.error(`Error al enviar correo (${codigo})`);
    throw new ErrorNegocio(502, 'No se pudo enviar el correo');
  }
};
