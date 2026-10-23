import { Request, Response, Router } from 'express';
import { sequelize } from '../models';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

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
