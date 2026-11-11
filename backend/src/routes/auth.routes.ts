import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware';

import {
  login,
  me,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Autenticación
 *     description: Inicio de sesión y recuperación de contraseña
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@contasys.hn
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Faltan datos
 *       401:
 *         description: Credenciales inválidas
 *       403:
 *         description: Usuario inactivo
 *       500:
 *         description: Error del servidor
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Datos del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: No autorizado
 */
router.get('/me', authMiddleware, me);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar PIN de recuperación de contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@gmail.com
 *     responses:
 *       200:
 *         description: Solicitud procesada. Si el correo está registrado, recibirá un PIN.
 *       400:
 *         description: Correo obligatorio
 *       500:
 *         description: Error al procesar la solicitud
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Verificar PIN y cambiar contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - pin
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@gmail.com
 *               pin:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "NuevaClave123"
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Datos inválidos, PIN incorrecto o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/reset-password', resetPassword);

export default router;