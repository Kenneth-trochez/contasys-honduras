import { Request, Response, Router } from 'express';
import { sequelize } from '../models';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();
/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Listar roles
 *     tags: [Seguridad]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               roles:
 *                 - id_rol: 1
 *                   nombre_rol: "Administrador"
 *                 - id_rol: 2
 *                   nombre_rol: "Auxiliar"
 *       401:
 *         description: No autorizado, falta token o token inválido
 *       403:
 *         description: Acceso denegado, se requiere rol de Administrador
 *       500:
 *         description: Error del servidor
 */
// GET /api/roles
router.get('/', authMiddleware, async (_req: Request, res: Response): Promise<void> => {
  try {
    const [roles] = await sequelize.query('SELECT * FROM roles');
    res.json({ ok: true, roles });
  } catch (e) {
    res.status(500).json({ ok: false, message: e instanceof Error ? e.message : String(e) });
  }
});

export default router;
