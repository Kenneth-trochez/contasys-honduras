import { Request, Response, Router, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { sequelize } from '../models';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

const mensajeError = (e: unknown): string => (e instanceof Error ? e.message : String(e));

// --- NUEVO: Middleware de Roles ---
const authorize = (...rolesPermitidos: number[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const usuario = (req as any).usuario || (req as any).user;
    if (!usuario || !rolesPermitidos.includes(usuario.id_rol)) {
      res.status(403).json({ ok: false, message: 'Acceso denegado: Se requiere rol de Administrador' });
      return;
    }
    next();
  };
};

// 1. GET /api/usuarios - Solo Admin
router.get('/', authMiddleware, authorize(1), async (_req: Request, res: Response): Promise<void> => {
  try {
    const [usuarios] = await sequelize.query('SELECT id_usuario, nombre_completo, email, id_rol, estado FROM usuarios');
    res.json({ ok: true, usuarios });
  } catch (e) {
    res.status(500).json({ ok: false, message: mensajeError(e) });
  }
});

// 2. POST /api/usuarios - Solo Admin
router.post('/', authMiddleware, authorize(1), async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre_completo, email, password, id_rol } = req.body;
    if (!nombre_completo || !email || !password || !id_rol) {
      res.status(400).json({ ok: false, message: 'Faltan datos' });
      return;
    }
    const [existe] = await sequelize.query(
      `SELECT id_usuario FROM usuarios WHERE email = :email`,
      { replacements: { email } }
    );
    if ((existe as any[]).length > 0) {
      res.status(409).json({ ok: false, message: 'Email duplicado' });
      return;
    }
    const hash = await bcrypt.hash(password, 10);
    await sequelize.query(
      `INSERT INTO usuarios (nombre_completo, email, password_hash, id_rol, estado, fecha_creacion) VALUES (:nombre_completo, :email, :hash, :id_rol, 'Activo', NOW())`,
      { replacements: { nombre_completo, email, hash, id_rol } }
    );
    res.status(201).json({ ok: true, message: 'Usuario creado correctamente' });
  } catch (e) {
    console.log(e);
    res.status(500).json({ ok: false, message: mensajeError(e) });
  }
});

// 3. PUT - Solo Admin
router.put('/:id', authMiddleware, authorize(1), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre_completo, email, id_rol } = req.body;
    if (!nombre_completo || !email || !id_rol) {
      res.status(400).json({ ok: false, message: 'Faltan datos' });
      return;
    }
    const [existe] = await sequelize.query(
      `SELECT id_usuario FROM usuarios WHERE email = :email AND id_usuario != :id`,
      { replacements: { email, id } }
    );
    if ((existe as any[]).length > 0) {
      res.status(409).json({ ok: false, message: 'Email duplicado' });
      return;
    }
    await sequelize.query(
      `UPDATE usuarios SET nombre_completo=:nombre_completo, email=:email, id_rol=:id_rol WHERE id_usuario=:id`,
      { replacements: { nombre_completo, email, id_rol, id } }
    );
    res.json({ ok: true, message: 'Usuario actualizado correctamente' });
  } catch (e) {
    res.status(500).json({ ok: false, message: mensajeError(e) });
  }
});

// 4. PATCH estado - Solo Admin
router.patch('/:id/estado', authMiddleware, authorize(1), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (estado !== 'Activo' && estado !== 'Inactivo') {
      res.status(400).json({ ok: false, message: 'Estado debe ser Activo o Inactivo' });
      return;
    }
    await sequelize.query(
      `UPDATE usuarios SET estado=:estado WHERE id_usuario=:id`,
      { replacements: { estado, id } }
    );
    res.json({ ok: true, message: `Usuario ${estado} correctamente` });
  } catch (e) {
    res.status(500).json({ ok: false, message: mensajeError(e) });
  }
});

export default router;