import { Router } from 'express';
import * as controller from '../controllers/cuentas.controller';

const router = Router();


router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.patch('/:id/estado', controller.cambiarEstado);

export default router;
