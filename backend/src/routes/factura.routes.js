const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/factura.controller');
const {
  editarFacturaSchema,
  cambiarEstadoSchema,
} = require('../validators/factura.validator');

function validar(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      convert: true,
    });
    if (error) {
      return res.status(400).json({
        mensaje: error.details.map((detalle) => detalle.message).join('; '),
      });
    }
    req.body = value;
    next();
  };
}

router.get('/', facturaController.obtenerFacturas);
router.get('/:id', facturaController.obtenerFacturaPorId);
router.post('/', facturaController.crearFactura);
router.put('/:id', validar(editarFacturaSchema), facturaController.editarFactura);
router.patch('/:id/estado', validar(cambiarEstadoSchema), facturaController.cambiarEstado);

module.exports = router;
