const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/factura.controller');

router.get('/', facturaController.obtenerFacturas);
router.get('/:id', facturaController.obtenerFacturaPorId);
router.post('/', facturaController.crearFactura);
router.put('/:id', facturaController.editarFactura);
router.patch('/:id/estado', facturaController.cambiarEstado);

module.exports = router;