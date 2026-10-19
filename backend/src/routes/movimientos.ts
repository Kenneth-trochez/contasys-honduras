import { Router } from 'express';
import * as controller from '../controllers/inventarioController';

const router = Router();

router.post('/entradas', controller.registrarEntrada);
router.post('/salidas', controller.registrarSalida);
router.post('/ajustes', controller.registrarAjuste);
router.get('/movimientos', controller.listarMovimientos);

export default router;
