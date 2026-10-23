import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import { sequelize } from '../models';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

const mensajeError = (e: unknown): string => (e instanceof Error ? e.message : String(e));

// 1. GET /api/usuarios - Listar todos
router.get('/', authMiddleware, async (_req: Request, res: Response): Promise<void> => {
  try {
    const [usuarios] = await sequelize.query('SELECT id_usuario, nombre_completo, email, id_rol, estado FROM usuarios');
    res.json({ ok: true, usuarios });
  } catch (e) {
    res.status(500).json({ ok: false, message: mensajeError(e) });
  }
});

// 2. POST /api/usuarios - Crear (201 y 409)
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre_completo, email, password, id_rol } = req.body;
    if (!nombre_completo || !email || !password || !id_rol) {
      res.status(400).json({ ok: false, message: 'Faltan datos' });
      return;
    }
    // CORREGIDO: con replacements
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

// 3. PUT /api/usuarios/:id - Editar usuario
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre_completo, email, id_rol } = req.body;

    if (!nombre_completo || !email || !id_rol) {
      res.status(400).json({ ok: false, message: 'Faltan datos' });
      return;
    }

    // CORREGIDO: con replacements
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

// 4. PATCH /api/usuarios/:id/estado - Activar / Desactivar
router.patch('/:id/estado', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (estado !== 'Activo' && estado !== 'Inactivo') {
      res.status(400).json({ ok: false, message: 'Estado debe ser Activo o Inactivo' });
      return;
    }

    // CORREGIDO: con replacements
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