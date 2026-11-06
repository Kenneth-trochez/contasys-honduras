
import { Router } from 'express';
import * as terceroController from '../controllers/tercero.controller';
import authMiddleware from '../middlewares/auth.middleware';
import verificarRol from '../middlewares/roles.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Terceros
 *     description: Gestión de clientes y proveedores
 */

/**
 * @swagger
 * /api/terceros:
 *   get:
 *     tags: [Terceros]
 *     summary: Listar terceros
 *     description: Consulta los terceros registrados. Permite filtrar por tipo, estado o nombre.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         description: Tipo de tercero
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Estado del tercero
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Texto para buscar terceros
 *     responses:
 *       200:
 *         description: Lista de terceros obtenida correctamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/',
  authMiddleware,
  verificarRol('administrador', 'contador', 'auxiliar contable'),
  terceroController.listar
);

/**
 * @swagger
 * /api/terceros/{id}:
 *   get:
 *     tags: [Terceros]
 *     summary: Obtener tercero por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del tercero
 *     responses:
 *       200:
 *         description: Tercero encontrado
 *       404:
 *         description: Tercero no encontrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/:id',
  authMiddleware,
  verificarRol('administrador', 'contador', 'auxiliar contable'),
  terceroController.obtenerPorId
);

/**
 * @swagger
 * /api/terceros:
 *   post:
 *     tags: [Terceros]
 *     summary: Crear un tercero
 *     description: Registra un nuevo cliente, proveedor o tercero.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo_tercero:
 *                 type: string
 *                 example: Cliente
 *               nombre_razon_social:
 *                 type: string
 *                 example: Comercial La Esperanza
 *               rtn:
 *                 type: string
 *                 example: "08011999123456"
 *               telefono:
 *                 type: string
 *                 example: "98765432"
 *               email:
 *                 type: string
 *                 example: "contacto@example.com"
 *               direccion:
 *                 type: string
 *                 example: Tegucigalpa, Honduras
 *               estado:
 *                 type: string
 *                 example: Activo
 *     responses:
 *       201:
 *         description: Tercero creado correctamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El RTN ya está registrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/',
  authMiddleware,
  verificarRol('administrador', 'contador', 'auxiliar contable'),
  terceroController.crear
);

/**
 * @swagger
 * /api/terceros/{id}:
 *   put:
 *     tags: [Terceros]
 *     summary: Actualizar un tercero
 *     description: Actualiza los datos de un tercero existente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del tercero
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo_tercero:
 *                 type: string
 *                 example: Cliente
 *               nombre_razon_social:
 *                 type: string
 *                 example: Comercial La Esperanza
 *               rtn:
 *                 type: string
 *                 example: "08011999123456"
 *               telefono:
 *                 type: string
 *                 example: "98765432"
 *               email:
 *                 type: string
 *                 example: "contacto@example.com"
 *               direccion:
 *                 type: string
 *                 example: Tegucigalpa, Honduras
 *               estado:
 *                 type: string
 *                 example: Activo
 *     responses:
 *       200:
 *         description: Tercero actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Tercero no encontrado
 *       409:
 *         description: El RTN ya está registrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.put(
  '/:id',
  authMiddleware,
  verificarRol('administrador', 'contador'),
  terceroController.actualizar
);

/**
 * @swagger
 * /api/terceros/{id}/estado:
 *   patch:
 *     tags: [Terceros]
 *     summary: Cambiar estado de un tercero
 *     description: Permite activar o desactivar un tercero.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del tercero
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
 *                 enum: [Activo, Inactivo]
 *                 example: Inactivo
 *     responses:
 *       200:
 *         description: Estado del tercero actualizado correctamente
 *       400:
 *         description: Estado inválido
 *       404:
 *         description: Tercero no encontrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.patch(
  '/:id/estado',
  authMiddleware,
  verificarRol('administrador', 'contador'),
  terceroController.cambiarEstado
);

export default router;
