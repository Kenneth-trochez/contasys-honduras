import { Router } from 'express';
import * as controller from '../controllers/cuentas.controller';
import authMiddleware from '../middlewares/auth.middleware';
import verificarRol from '../middlewares/roles.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Cuentas
 *     description: Catálogo de cuentas contables
 */

/**
 * @swagger
 * /api/cuentas:
 *   get:
 *     tags: [Cuentas]
 *     summary: Listar cuentas contables
 *     description: Consulta el catálogo de cuentas ordenado por código. Permite filtrar por tipo, estado, nivel, cuenta padre o texto.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipoCuenta
 *         schema:
 *           type: string
 *           enum: [Activo, Pasivo, Patrimonio, Ingreso, Gasto]
 *         description: Tipo de cuenta
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Activo, Inactivo]
 *         description: Estado de la cuenta
 *       - in: query
 *         name: nivel
 *         schema:
 *           type: integer
 *         description: Nivel jerárquico de la cuenta
 *       - in: query
 *         name: idCuentaPadre
 *         schema:
 *           type: integer
 *         description: Identificador de la cuenta padre
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Texto para buscar por código o nombre
 *     responses:
 *       200:
 *         description: Lista de cuentas obtenida correctamente
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
 * /api/cuentas/{id}:
 *   get:
 *     tags: [Cuentas]
 *     summary: Obtener cuenta por ID
 *     description: Devuelve una cuenta junto con los datos de su cuenta padre.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador de la cuenta
 *     responses:
 *       200:
 *         description: Cuenta encontrada
 *       400:
 *         description: Identificador inválido
 *       404:
 *         description: Cuenta no encontrada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), controller.obtener);

/**
 * @swagger
 * /api/cuentas:
 *   post:
 *     tags: [Cuentas]
 *     summary: Crear una cuenta contable
 *     description: Registra una cuenta validando su jerarquía. El tipo debe coincidir con el de la cuenta padre y el nivel debe ser el del padre más uno. Una cuenta sin padre debe ser de nivel 1.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - nombre
 *               - tipoCuenta
 *               - naturaleza
 *               - nivel
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: "1.1.01"
 *               nombre:
 *                 type: string
 *                 example: Caja general
 *               tipoCuenta:
 *                 type: string
 *                 enum: [Activo, Pasivo, Patrimonio, Ingreso, Gasto]
 *                 example: Activo
 *               naturaleza:
 *                 type: string
 *                 enum: [Deudora, Acreedora]
 *                 example: Deudora
 *               idCuentaPadre:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *               nivel:
 *                 type: integer
 *                 example: 3
 *               aceptaMovimientos:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Cuenta creada correctamente
 *       400:
 *         description: Datos inválidos, o tipo/nivel que no coincide con la cuenta padre
 *       404:
 *         description: La cuenta padre no existe
 *       409:
 *         description: Ya existe una cuenta con ese código
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authMiddleware, verificarRol('administrador','contador'), controller.crear);

/**
 * @swagger
 * /api/cuentas/{id}:
 *   put:
 *     tags: [Cuentas]
 *     summary: Actualizar una cuenta contable
 *     description: Actualiza los datos de una cuenta existente. Solo se envían los campos que se desean cambiar y se vuelven a validar las reglas de jerarquía.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador de la cuenta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: "1.1.01"
 *               nombre:
 *                 type: string
 *                 example: Caja general principal
 *               tipoCuenta:
 *                 type: string
 *                 enum: [Activo, Pasivo, Patrimonio, Ingreso, Gasto]
 *                 example: Activo
 *               naturaleza:
 *                 type: string
 *                 enum: [Deudora, Acreedora]
 *                 example: Deudora
 *               idCuentaPadre:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *               nivel:
 *                 type: integer
 *                 example: 3
 *               aceptaMovimientos:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Cuenta actualizada correctamente
 *       400:
 *         description: Datos inválidos o jerarquía incorrecta
 *       404:
 *         description: Cuenta o cuenta padre no encontrada
 *       409:
 *         description: Ya existe una cuenta con ese código
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authMiddleware, verificarRol('administrador','contador'), controller.actualizar);

/**
 * @swagger
 * /api/cuentas/{id}/estado:
 *   patch:
 *     tags: [Cuentas]
 *     summary: Cambiar estado de una cuenta
 *     description: Activa o desactiva una cuenta sin eliminarla. No se puede desactivar una cuenta con cuentas hijas activas, ni activar una cuenta cuya cuenta padre está inactiva.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador de la cuenta
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
 *         description: Estado de la cuenta actualizado correctamente
 *       400:
 *         description: Estado inválido
 *       404:
 *         description: Cuenta no encontrada
 *       409:
 *         description: La cuenta tiene cuentas hijas activas, o su cuenta padre está inactiva
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/estado', authMiddleware, verificarRol('administrador','contador'), controller.cambiarEstado);

export default router;