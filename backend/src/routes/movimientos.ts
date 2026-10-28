import { Router } from 'express';
import * as controller from '../controllers/inventarioController';
import authMiddleware from '../middlewares/auth.middleware';
import verificarRol from '../middlewares/roles.middleware';

const router = Router();

router.get('/movimientos', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), controller.listarMovimientos);

router.post('/entradas', authMiddleware, verificarRol('administrador','contador'), controller.registrarEntrada);
router.post('/salidas', authMiddleware, verificarRol('administrador','contador'), controller.registrarSalida);
router.post('/ajustes', authMiddleware, verificarRol('administrador','contador'), controller.registrarAjuste);

export default router;