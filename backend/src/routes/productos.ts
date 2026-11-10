import { Router } from 'express';
import * as controller from '../controllers/inventarioController';
import authMiddleware from '../middlewares/auth.middleware';
import verificarRol from '../middlewares/roles.middleware';
import { subirImagenProducto } from '../middlewares/subirImagen';

const router = Router();

router.get('/', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), controller.listarProductos);
router.get('/:id', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), controller.obtenerProducto);

router.post('/', authMiddleware, verificarRol('administrador','contador'), controller.crearProducto);
router.put('/:id', authMiddleware, verificarRol('administrador','contador'), controller.actualizarProducto);
router.post('/:id/imagen', authMiddleware, verificarRol('administrador','contador'), subirImagenProducto, controller.subirImagenProducto);
router.patch('/:id/estado', authMiddleware, verificarRol('administrador','contador'), controller.cambiarEstadoProducto);

export default router;