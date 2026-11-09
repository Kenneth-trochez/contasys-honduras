import { Router } from 'express';
import * as controller from '../controllers/inventarioController';
import authMiddleware from '../middlewares/auth.middleware';
import verificarRol from '../middlewares/roles.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   responses:
 *     MovimientoRegistrado:
 *       description: Movimiento registrado. Devuelve el movimiento y el producto con el stock ya actualizado.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ok: { type: boolean, example: true }
 *               data:
 *                 type: object
 *                 properties:
 *                   movimiento: { $ref: '#/components/schemas/MovimientoInventario' }
 *                   producto: { $ref: '#/components/schemas/Producto' }
 *     MovimientoRechazado:
 *       description: Datos inválidos, producto inactivo o stock insuficiente
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ErrorInventario' }
 *           example: { ok: false, message: Stock insuficiente para registrar la salida }
 */

/**
 * @swagger
 * /api/inventario/movimientos:
 *   get:
 *     tags: [Inventario - Movimientos]
 *     summary: Historial de movimientos
 *     description: "Roles: Administrador, Contador, Auxiliar Contable. Del más reciente al más antiguo; cada movimiento incluye su producto."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idProducto
 *         schema: { type: integer }
 *         description: Solo los movimientos de este producto
 *       - in: query
 *         name: tipo
 *         schema: { type: string, enum: [Entrada, Salida, Ajuste] }
 *         description: Solo los movimientos de este tipo
 *     responses:
 *       200:
 *         description: Lista de movimientos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/MovimientoInventario'
 *                       - type: object
 *                         properties:
 *                           producto: { $ref: '#/components/schemas/Producto' }
 *       401: { $ref: '#/components/responses/InventarioNoAutenticado' }
 *       403: { $ref: '#/components/responses/InventarioSinPermiso' }
 *       500: { $ref: '#/components/responses/InventarioErrorInterno' }
 */
router.get('/movimientos', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), controller.listarMovimientos);

/**
 * @swagger
 * /api/inventario/entradas:
 *   post:
 *     tags: [Inventario - Movimientos]
 *     summary: Registrar una entrada de stock
 *     description: "Roles: Administrador, Contador. Suma la cantidad al stock. El usuario se toma del token."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MovimientoNuevo' }
 *           example: { idProducto: 6, cantidad: 50, motivo: Compra inicial }
 *     responses:
 *       201: { $ref: '#/components/responses/MovimientoRegistrado' }
 *       400: { $ref: '#/components/responses/MovimientoRechazado' }
 *       401: { $ref: '#/components/responses/InventarioNoAutenticado' }
 *       403: { $ref: '#/components/responses/InventarioSinPermiso' }
 *       404: { $ref: '#/components/responses/InventarioNoEncontrado' }
 *       500: { $ref: '#/components/responses/InventarioErrorInterno' }
 */
router.post('/entradas', authMiddleware, verificarRol('administrador','contador'), controller.registrarEntrada);

/**
 * @swagger
 * /api/inventario/salidas:
 *   post:
 *     tags: [Inventario - Movimientos]
 *     summary: Registrar una salida de stock
 *     description: "Roles: Administrador, Contador. Resta la cantidad del stock; si la cantidad es mayor que el stock disponible responde 400. El usuario se toma del token."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MovimientoNuevo' }
 *           example: { idProducto: 6, cantidad: 20, motivo: Venta }
 *     responses:
 *       201: { $ref: '#/components/responses/MovimientoRegistrado' }
 *       400: { $ref: '#/components/responses/MovimientoRechazado' }
 *       401: { $ref: '#/components/responses/InventarioNoAutenticado' }
 *       403: { $ref: '#/components/responses/InventarioSinPermiso' }
 *       404: { $ref: '#/components/responses/InventarioNoEncontrado' }
 *       500: { $ref: '#/components/responses/InventarioErrorInterno' }
 */
router.post('/salidas', authMiddleware, verificarRol('administrador','contador'), controller.registrarSalida);

/**
 * @swagger
 * /api/inventario/ajustes:
 *   post:
 *     tags: [Inventario - Movimientos]
 *     summary: Registrar un ajuste de stock
 *     description: "Roles: Administrador, Contador. La cantidad puede ser positiva o negativa (por ejemplo, tras un conteo físico), pero no puede dejar el stock en negativo. El usuario se toma del token."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MovimientoNuevo' }
 *           example: { idProducto: 6, cantidad: -5, motivo: Conteo físico }
 *     responses:
 *       201: { $ref: '#/components/responses/MovimientoRegistrado' }
 *       400: { $ref: '#/components/responses/MovimientoRechazado' }
 *       401: { $ref: '#/components/responses/InventarioNoAutenticado' }
 *       403: { $ref: '#/components/responses/InventarioSinPermiso' }
 *       404: { $ref: '#/components/responses/InventarioNoEncontrado' }
 *       500: { $ref: '#/components/responses/InventarioErrorInterno' }
 */
router.post('/ajustes', authMiddleware, verificarRol('administrador','contador'), controller.registrarAjuste);

export default router;
