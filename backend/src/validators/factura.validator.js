const Joi = require('joi');

const detalleSchema = Joi.object({
  descripcion: Joi.string().trim().required(),
  cantidad: Joi.number().positive().required(),
  precio_unitario: Joi.number().positive().required()
});

const crearFacturaSchema = Joi.object({
  numero_factura: Joi.string().trim().required(),
  cai: Joi.string().trim().required(),
  id_tercero: Joi.number().integer().positive().required(),
  id_usuario_emisor: Joi.number().integer().positive().required(),
  detalles: Joi.array().items(detalleSchema).min(1).required()
});

const editarFacturaSchema = Joi.object({
  cai: Joi.string().trim().optional(),
  id_tercero: Joi.number().integer().positive().optional(),
  detalles: Joi.array().items(detalleSchema).min(1).optional()
});

const cambiarEstadoSchema = Joi.object({
  estado: Joi.string().valid('Emitida', 'Anulada', 'Pagada').required()
});

module.exports = {
  crearFacturaSchema,
  editarFacturaSchema,
  cambiarEstadoSchema
};