import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { ObjectSchema } from 'joi';
import * as facturaController from '../controllers/factura.controller';
import {
  crearFacturaSchema,
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

router.get('/', facturaController.obtenerFacturas);
router.get('/:id', facturaController.obtenerFacturaPorId);
router.post('/', validar(crearFacturaSchema), facturaController.crearFactura);
router.put('/:id', validar(editarFacturaSchema), facturaController.editarFactura);
router.patch('/:id/estado', validar(cambiarEstadoSchema), facturaController.cambiarEstado);

export default router;
/**
 * @swagger
 * tags:
 *   name: Facturas
 *   description: Gestión y administración de facturas
 */

/**
 * @swagger
 * /api/facturas:
 *   get:
 *     summary: Obtener todas las facturas
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de facturas obtenida con éxito
 *       401:
 *         description: No autorizado (Token faltante o inválido)
 *       403:
 *         description: Prohibido (Sin permisos suficientes)
 *   post:
 *     summary: Crear una nueva factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero_factura
 *               - cai
 *               - id_tercero
 *               - id_usuario_emisor
 *               - detalles
 *             properties:
 *               numero_factura:
 *                 type: string
 *                 example: "000-001-01-0000070"
 *               cai:
 *                 type: string
 *                 example: "3A8F2C-981D2E-734B90-112233"
 *               fecha_emision:
 *                 type: string
 *                 format: date
 *                 example: "2026-10-15"
 *               id_tercero:
 *                 type: integer
 *                 example: 1
 *               id_usuario_emisor:
 *                 type: integer
 *                 example: 1
 *               detalles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - descripcion_item
 *                     - cantidad
 *                     - precio_unitario
 *                   properties:
 *                     descripcion_item:
 *                       type: string
 *                       example: "Servicios Profesionales"
 *                     cantidad:
 *                       type: number
 *                       example: 2.00
 *                     precio_unitario:
 *                       type: number
 *                       example: 500.00
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *       400:
 *         description: Datos inválidos (Falta CAI, formato incorrecto, etc.)
 *       404:
 *         description: Tercero o recurso relacionado no encontrado
 *       409:
 *         description: Conflicto (El número de factura ya está registrado)
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/facturas/{id}:
 *   get:
 *     summary: Obtener una factura por su ID
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura encontrada con éxito
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 *   put:
 *     summary: Actualizar una factura existente
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cai:
 *                 type: string
 *                 example: "3A8F2C-981D2E-734B90-999999"
 *               detalles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     descripcion_item:
 *                       type: string
 *                       example: "Servicios Modificados y Actualizados"
 *                     cantidad:
 *                       type: number
 *                       example: 4
 *                     precio_unitario:
 *                       type: number
 *                       example: 300.00
 *     responses:
 *       200:
 *         description: Factura actualizada exitosamente
 *       400:
 *         description: Solicitud incorrecta o intento de editar factura anulada
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/facturas/{id}/estado:
 *   patch:
 *     summary: Cambiar el estado de una factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [Emitida, Anulada, Pagada]
 *                 example: "Pagada"
 *     responses:
 *       200:
 *         description: Estado de la factura cambiado exitosamente
 *       400:
 *         description: Estado inválido o no permitido
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 */
