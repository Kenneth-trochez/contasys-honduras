const Joi = require('joi');

const detalleSchema = Joi.object({
  productoId: Joi.number().integer().positive().required(),
  cantidad: Joi.number().positive().precision(2).required(),
  precioUnitario: Joi.number().positive().precision(2).required()
});

const crearFacturaSchema = Joi.object({
  numeroFactura: Joi.string().trim().required(),
  cai: Joi.string().trim().required(),
  terceroId: Joi.number().integer().positive().required(),
  detalles: Joi.array().items(detalleSchema).min(1).required()
});

const editarFacturaSchema = Joi.object({
  cai: Joi.string().trim().optional(),
  detalles: Joi.array().items(detalleSchema).min(1).optional()
});

const cambiarEstadoSchema = Joi.object({
  estado: Joi.string().valid('EMITIDA', 'ANULADA').required()
});

module.exports = {
  crearFacturaSchema,
  editarFacturaSchema,
  cambiarEstadoSchema
};