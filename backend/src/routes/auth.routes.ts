import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sequelize } from '../models';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Autenticación
 *     description: Inicio de sesión y datos del usuario autenticado
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
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               token: "eyJhbGciOi..."
 *               usuario:
 *                 id_usuario: 1
 *                 email: "admin@contasys.hn"
 *                 id_rol: 1
 *       400:
 *         description: Faltan email y password
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { correo, email, password } = req.body;
    const correoLogin = email || correo;

    if (!correoLogin || !password) {
      res.status(400).json({ ok: false, message: 'Faltan email y password' });
      return;
    }

    const [rows]: any = await sequelize.query(
      'SELECT * FROM usuarios WHERE email = :email LIMIT 1',
      { replacements: { email: correoLogin } }
    );
    const usuario = rows[0];

    if (!usuario) {
      res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
      return;
    }

    const ok = await bcrypt.compare(password, usuario.password_hash);
    if (!ok) {
      res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
      return;
    }

    const token = jwt.sign(
  { 
    id: usuario.id_usuario, // <- esto es lo que Passport busca
    id_usuario: usuario.id_usuario, 
    id_rol: usuario.id_rol, 
    email: usuario.email 
  },
  process.env.JWT_SECRET!,
  { expiresIn: '8h' }
);

    res.json({
      ok: true,
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        id_rol: usuario.id_rol,
      },
    });
  } catch (e) {
    res.status(500).json({ ok: false, message: e instanceof Error ? e.message : String(e) });
  }
});

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
 *          content:
 *           application/json:
 *             example:
 *               ok: true
 *               usuario:
 *                 id: 1
 *                 id_rol: 1
 *                 rol: "Administrador"
 *       401:
 *         description: No autorizado
 */
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  res.json({ ok: true, usuario: (req as any).usuario || (req as any).user });
});

export default router;