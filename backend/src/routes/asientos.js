const { Router } = require('express');
const controller = require('../controllers/asientosController');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

const router = Router();

router.use(verificarToken);

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', verificarRol('Administrador', 'Contador'), controller.crear);
router.put('/:id', verificarRol('Administrador', 'Contador'), controller.actualizar);
router.patch('/:id/estado', verificarRol('Administrador', 'Contador'), controller.cambiarEstado);

module.exports = router;
