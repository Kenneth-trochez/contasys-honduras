const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/factura.controller');
// Middleware de autenticación (Ejemplo)
const { autenticarUsuario } = require('../middlewares/auth.middleware');

router.get('/', autenticarUsuario, facturaController.obtenerFacturas);
router.get('/:id', autenticarUsuario, facturaController.obtenerFacturaPorId);
router.post('/', autenticarUsuario, facturaController.crearFactura);
router.patch('/:id/estado', autenticarUsuario, facturaController.cambiarEstado);
router.put('/:id', autenticarUsuario, facturaController.editarFactura);
module.exports = router;