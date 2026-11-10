import { Router } from 'express';
import * as controller from '../controllers/asientosController';
import authMiddleware from '../middlewares/auth.middleware';
import verificarRol from '../middlewares/roles.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Asientos contables
 *     description: Registro y consulta de asientos contables con sus líneas de debe y haber
 */

/**
 * @swagger
 * /api/asientos:
 *   get:
 *     tags: [Asientos contables]
 *     summary: Listar asientos contables
 *     description: Devuelve todos los asientos con sus líneas de detalle, ordenados del número más reciente al más antiguo.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de asientos obtenida correctamente
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data:
 *                 - idAsiento: 1
 *                   numeroAsiento: 1
 *                   fechaAsiento: "2026-11-09"
 *                   concepto: Venta de mercadería al contado
 *                   idUsuarioRegistro: 1
 *                   estado: Publicado
 *                   fechaRegistro: "2026-11-09T15:30:00.000Z"
 *                   detalles:
 *                     - idDetalleAsiento: 1
 *                       idAsiento: 1
 *                       idCuenta: 3
 *                       debe: "1500.00"
 *                       haber: "0.00"
 *                     - idDetalleAsiento: 2
 *                       idAsiento: 1
 *                       idCuenta: 12
 *                       debe: "0.00"
 *                       haber: "1500.00"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), controller.listar);

/**
 * @swagger
 * /api/asientos/{id}:
 *   get:
 *     tags: [Asientos contables]
 *     summary: Obtener asiento por ID
 *     description: Devuelve un asiento con sus líneas de detalle.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del asiento
 *     responses:
 *       200:
 *         description: Asiento encontrado
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data:
 *                 idAsiento: 1
 *                 numeroAsiento: 1
 *                 fechaAsiento: "2026-11-09"
 *                 concepto: Venta de mercadería al contado
 *                 idUsuarioRegistro: 1
 *                 estado: Publicado
 *                 fechaRegistro: "2026-11-09T15:30:00.000Z"
 *                 detalles:
 *                   - idDetalleAsiento: 1
 *                     idAsiento: 1
 *                     idCuenta: 3
 *                     debe: "1500.00"
 *                     haber: "0.00"
 *                   - idDetalleAsiento: 2
 *                     idAsiento: 1
 *                     idCuenta: 12
 *                     debe: "0.00"
 *                     haber: "1500.00"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Asiento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), controller.obtener);

/**
 * @swagger
 * /api/asientos:
 *   post:
 *     tags: [Asientos contables]
 *     summary: Crear un asiento contable
 *     description: >
 *       Registra un asiento con estado Publicado. La suma del debe debe ser igual a la suma del haber,
 *       cada línea lleva un monto en debe o en haber (no en ambos) y las cuentas deben estar activas
 *       y aceptar movimientos. Si no se envía numeroAsiento se asigna el siguiente consecutivo.
 *       El usuario que registra se toma del token.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fechaAsiento
 *               - concepto
 *               - detalles
 *             properties:
 *               numeroAsiento:
 *                 type: integer
 *                 example: 1
 *               fechaAsiento:
 *                 type: string
 *                 format: date
 *                 example: "2026-11-09"
 *               concepto:
 *                 type: string
 *                 example: Venta de mercadería al contado
 *               detalles:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - idCuenta
 *                   properties:
 *                     idCuenta:
 *                       type: integer
 *                       example: 3
 *                     debe:
 *                       type: number
 *                       example: 1500
 *                     haber:
 *                       type: number
 *                       example: 0
 *     responses:
 *       201:
 *         description: Asiento creado correctamente
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data:
 *                 idAsiento: 1
 *                 numeroAsiento: 1
 *                 fechaAsiento: "2026-11-09"
 *                 concepto: Venta de mercadería al contado
 *                 idUsuarioRegistro: 1
 *                 estado: Publicado
 *                 detalles:
 *                   - idCuenta: 3
 *                     debe: "1500.00"
 *                     haber: "0.00"
 *                   - idCuenta: 12
 *                     debe: "0.00"
 *                     haber: "1500.00"
 *       400:
 *         description: Datos inválidos (campos obligatorios, detalle vacío, montos negativos, debe y haber a la vez, asiento descuadrado o cuenta que no acepta movimientos)
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               message: La suma del Debe debe ser igual a la suma del Haber
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       409:
 *         description: El número de asiento ya existe
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authMiddleware, verificarRol('administrador','contador'), controller.crear);

/**
 * @swagger
 * /api/asientos/{id}:
 *   put:
 *     tags: [Asientos contables]
 *     summary: Actualizar un asiento contable
 *     description: >
 *       Solo se puede editar un asiento en estado Borrador. Si se envían detalles reemplazan por completo
 *       las líneas anteriores y se vuelven a validar (cuadre de debe y haber, cuentas activas).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del asiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fechaAsiento:
 *                 type: string
 *                 format: date
 *                 example: "2026-11-10"
 *               concepto:
 *                 type: string
 *                 example: Venta de mercadería al contado corregida
 *               detalles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - idCuenta
 *                   properties:
 *                     idCuenta:
 *                       type: integer
 *                       example: 3
 *                     debe:
 *                       type: number
 *                       example: 1800
 *                     haber:
 *                       type: number
 *                       example: 0
 *     responses:
 *       200:
 *         description: Asiento actualizado correctamente
 *       400:
 *         description: Datos inválidos o el asiento no está en estado Borrador
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               message: Solo se puede editar un asiento en estado Borrador
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Asiento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authMiddleware, verificarRol('administrador','contador'), controller.actualizar);

/**
 * @swagger
 * /api/asientos/{id}/estado:
 *   patch:
 *     tags: [Asientos contables]
 *     summary: Cambiar estado de un asiento
 *     description: Cambia el estado del asiento a Borrador, Publicado o Anulado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del asiento
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
 *                 enum: [Borrador, Publicado, Anulado]
 *                 example: Anulado
 *     responses:
 *       200:
 *         description: Estado del asiento actualizado correctamente
 *       400:
 *         description: Estado inválido
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               message: "Estado inválido, use uno de: Borrador, Publicado, Anulado"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Asiento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/estado', authMiddleware, verificarRol('administrador','contador'), controller.cambiarEstado);

export default router;
