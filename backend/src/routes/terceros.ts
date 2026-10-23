import { Router } from 'express';
import * as terceroController from '../controllers/tercero.controller';

const router = Router();

router.get('/', terceroController.listar);

router.get('/:id', terceroController.obtenerPorId);

router.post('/', terceroController.crear);

router.put('/:id', terceroController.actualizar);

router.patch('/:id/estado', terceroController.cambiarEstado);

export default router;
