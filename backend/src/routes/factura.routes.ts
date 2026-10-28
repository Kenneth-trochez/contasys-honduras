import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { ObjectSchema } from 'joi';
import * as facturaController from '../controllers/factura.controller';
import {
  editarFacturaSchema,
  cambiarEstadoSchema,
} from '../validators/factura.validator';
import authMiddleware from '../middlewares/auth.middleware';
import verificarRol from '../middlewares/roles.middleware';

const router = Router();

function validar(schema: ObjectSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      convert: true,
    });
    if (error) {
      res.status(400).json({
        mensaje: error.details.map((detalle) => detalle.message).join('; '),
      });
      return;
    }
    req.body = value;
    next();
  };
}

router.get('/', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), facturaController.obtenerFacturas);
router.get('/:id', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), facturaController.obtenerFacturaPorId);
router.post('/', authMiddleware, verificarRol('administrador','contador'), facturaController.crearFactura);
router.put('/:id', authMiddleware, verificarRol('administrador','contador'), validar(editarFacturaSchema), facturaController.editarFactura);
router.patch('/:id/estado', authMiddleware, verificarRol('administrador','contador'), validar(cambiarEstadoSchema), facturaController.cambiarEstado);

export default router;