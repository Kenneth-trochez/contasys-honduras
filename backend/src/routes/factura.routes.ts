import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { ObjectSchema } from 'joi';
import * as facturaController from '../controllers/factura.controller';
import {
  editarFacturaSchema,
  cambiarEstadoSchema,
} from '../validators/factura.validator';

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

router.get('/', facturaController.obtenerFacturas);
router.get('/:id', facturaController.obtenerFacturaPorId);
router.post('/', facturaController.crearFactura);
router.put('/:id', validar(editarFacturaSchema), facturaController.editarFactura);
router.patch('/:id/estado', validar(cambiarEstadoSchema), facturaController.cambiarEstado);

export default router;
