import { Router } from 'express';
import * as terceroController from '../controllers/tercero.controller';
import authMiddleware from '../middlewares/auth.middleware';
import verificarRol from '../middlewares/roles.middleware';

const router = Router();

// CONSULTAR - lo pueden hacer los 3 roles (según tu tabla: administrador, contador, auxiliar contable)
router.get('/', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), terceroController.listar);
router.get('/:id', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), terceroController.obtenerPorId);

// REGISTRAR - lo pueden hacer los 3 roles
router.post('/', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), terceroController.crear);

// ACTUALIZAR Y CAMBIAR ESTADO - solo admin y contador (auxiliar no)
router.put('/:id', authMiddleware, verificarRol('administrador','contador'), terceroController.actualizar);
router.patch('/:id/estado', authMiddleware, verificarRol('administrador','contador'), terceroController.cambiarEstado);

export default router;