import Joi from 'joi';

const detalleSchema = Joi.object({
  id_producto: Joi.number().integer().positive().allow(null),
  descripcion_item: Joi.string().trim(),
  descripcion: Joi.string().trim(),
  cantidad: Joi.number().positive().required(),
  precio_unitario: Joi.number().positive().required()
}).or('descripcion_item', 'descripcion');

export const crearFacturaSchema = Joi.object({
  numero_factura: Joi.string().trim().required(),
  cai: Joi.string().trim().required(),
  id_tercero: Joi.number().integer().positive().required(),
  id_usuario_emisor: Joi.number().integer().positive().required(),
  fecha_emision: Joi.date().optional(),
  detalles: Joi.array().items(detalleSchema).min(1).required()
});

export const editarFacturaSchema = Joi.object({
  cai: Joi.string().trim().optional(),
  id_tercero: Joi.number().integer().positive().optional(),
  fecha_emision: Joi.date().optional(),
  detalles: Joi.array().items(detalleSchema).min(1).optional()
}).min(1);

export const cambiarEstadoSchema = Joi.object({
  estado: Joi.string().valid('Emitida', 'Anulada', 'Pagada').required()
});
