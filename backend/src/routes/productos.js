const { Router } = require('express');
const controller = require('../controllers/inventarioController');

const router = Router();

router.get('/', controller.listarProductos);
router.get('/:id', controller.obtenerProducto);
router.post('/', controller.crearProducto);
router.put('/:id', controller.actualizarProducto);
router.patch('/:id/estado', controller.cambiarEstadoProducto);

module.exports = router;
