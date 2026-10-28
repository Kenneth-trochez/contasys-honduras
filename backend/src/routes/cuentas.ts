import { Router } from 'express';
import * as controller from '../controllers/cuentas.controller';
import authMiddleware from '../middlewares/auth.middleware';
import verificarRol from '../middlewares/roles.middleware';

const router = Router();

// Consultar - los 3 roles
router.get('/', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), controller.listar);
router.get('/:id', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), controller.obtener);

// Crear, actualizar, cambiar estado - solo admin y contador
router.post('/', authMiddleware, verificarRol('administrador','contador'), controller.crear);
router.put('/:id', authMiddleware, verificarRol('administrador','contador'), controller.actualizar);
router.patch('/:id/estado', authMiddleware, verificarRol('administrador','contador'), controller.cambiarEstado);

export default router;