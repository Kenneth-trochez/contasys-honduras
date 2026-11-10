import { Request, Response, Router } from 'express';
import { enviarCorreo } from '../services/correo.service';
import ErrorNegocio from '../utils/errorNegocio';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Correo
 *     description: Servicio de envío de correos (ruta temporal de pruebas)
 */

/**
 * @swagger
 * /api/correo/prueba:
 *   post:
 *     tags: [Correo]
 *     summary: Enviar un correo de prueba
 *     description: >
 *       RUTA TEMPORAL, solo para probar el servicio de correo (Nodemailer).
 *       Envía un mensaje fijo ("Prueba ContaSys") al destinatario indicado,
 *       desde la cuenta configurada en las variables MAIL_* del .env.
 *       Actualmente no requiere token (no lleva security bearerAuth);
 *       si el equipo decide protegerla, se agregaría authMiddleware en la ruta
 *       y security bearerAuth en esta documentación.
 *       Debe eliminarse cuando el servicio se use desde funcionalidades reales.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [para]
 *             properties:
 *               para:
 *                 type: string
 *                 description: Correo del destinatario
 *                 example: destinatario@ejemplo.com
 *     responses:
 *       200:
 *         description: Correo enviado correctamente
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               message: Correo enviado
 *       400:
 *         description: Falta el campo "para"
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               message: El campo "para" es requerido
 *       500:
 *         description: Configuración de correo incompleta (falta alguna variable MAIL_*) o error interno
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               message: "Configuración de correo incompleta: falta MAIL_HOST"
 *       502:
 *         description: El servidor de correo (SMTP) rechazó o no pudo enviar el mensaje
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               message: No se pudo enviar el correo
 */
// POST /api/correo/prueba  (ruta temporal para probar el servicio de correo)
router.post('/prueba', async (req: Request, res: Response): Promise<void> => {
  const { para } = req.body;
  if (!para) {
    res.status(400).json({ ok: false, message: 'El campo "para" es requerido' });
    return;
  }

  try {
    await enviarCorreo({
      para,
      asunto: 'Prueba ContaSys',
      texto: 'Si recibes este mensaje, el servicio de correo funciona.',
    });
    res.json({ ok: true, message: 'Correo enviado' });
  } catch (e) {
    const status = e instanceof ErrorNegocio ? e.status : 500;
    res.status(status).json({ ok: false, message: e instanceof Error ? e.message : 'Error al enviar el correo' });
  }
});

export default router;
