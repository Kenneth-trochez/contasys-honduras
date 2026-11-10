import { Request, Response, Router } from 'express';
import { enviarCorreo } from '../services/correo.service';
import ErrorNegocio from '../utils/errorNegocio';

const router = Router();

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
