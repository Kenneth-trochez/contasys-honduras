const { Factura, DetalleFactura, sequelize } = require('../models');

const TASA_ISV = 0.15;

class FacturaService {

  static calcularTotales(detalles) {
    let subtotal = 0;
    const detallesProcesados = detalles.map(det => {
      const subtotalLinea = Number((det.cantidad * det.precio_unitario).toFixed(2));
      subtotal += subtotalLinea;
      return { ...det, subtotal_linea: subtotalLinea };
    });

    const impuestoIsv = Number((subtotal * TASA_ISV).toFixed(2));
    const total = Number((subtotal + impuestoIsv).toFixed(2));

    return { subtotal, impuestoIsv, total, detallesProcesados };
  }

  static async crearFactura(data) {
    const transaction = await sequelize.transaction();
    try {
      const existe = await Factura.findOne({ where: { numero_factura: data.numero_factura }, transaction });
      if (existe) {
        const err = new Error('El número de factura ya se encuentra registrado.');
        err.status = 409;
        throw err;
      }

      const { subtotal, impuestoIsv, total, detallesProcesados } = this.calcularTotales(data.detalles);

      const nuevaFactura = await Factura.create({
        numero_factura: data.numero_factura,
        cai: data.cai,
        fecha_emision: data.fecha_emision || new Date(),
        id_tercero: data.id_tercero,
        id_usuario_emisor: data.id_usuario_emisor,
        subtotal,
        impuesto_isv: impuestoIsv,
        total,
        estado: 'Emitida'
      }, { transaction });

      const detallesConId = detallesProcesados.map(d => ({
        id_factura: nuevaFactura.id_factura, // <--- Aquí debe usar id_factura
        id_producto: d.id_producto || null,
        descripcion_item: d.descripcion_item,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        subtotal_linea: d.subtotal_linea
      }));

      await DetalleFactura.bulkCreate(detallesConId, { transaction });

      await transaction.commit();
      return await this.obtenerFacturaPorId(nuevaFactura.id_factura); // <--- Aquí también
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async obtenerFacturas() {
    return await Factura.findAll();
  }

  static async obtenerFacturaPorId(id) {
    const factura = await Factura.findByPk(id);
    if (!factura) {
      const err = new Error('Factura no encontrada.');
      err.status = 404;
      throw err;
    }
    const detalles = await DetalleFactura.findAll({ where: { id_factura: id } });
    return { ...factura.toJSON(), detalles };
  }
}

module.exports = FacturaService;