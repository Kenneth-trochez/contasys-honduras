
import { Router } from 'express';
import { login, me } from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Autenticación
 *     description: Inicio de sesión y consulta del usuario autenticado
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Iniciar sesión
 *     description: Autentica al usuario y devuelve un token JWT para acceder a los endpoints protegidos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@contasys.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Admin123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Devuelve el token JWT.
 *       400:
 *         description: Email y password son requeridos.
 *       401:
 *         description: Password incorrecta.
 *       403:
 *         description: Usuario inactivo.
 *       404:
 *         description: Usuario no existe.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Autenticación]
 *     summary: Obtener usuario autenticado
 *     description: Devuelve la información del usuario asociado al token JWT.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario autenticado obtenido correctamente.
 *       401:
 *         description: Token inválido, expirado o ausente.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/me', authMiddleware, me);

export default router;
