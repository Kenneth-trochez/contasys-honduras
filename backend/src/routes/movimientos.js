const { Router } = require('express');
const controller = require('../controllers/inventarioController');

const router = Router();

router.post('/entradas', controller.registrarEntrada);
router.post('/salidas', controller.registrarSalida);
router.post('/ajustes', controller.registrarAjuste);
router.get('/movimientos', controller.listarMovimientos);

module.exports = router;
