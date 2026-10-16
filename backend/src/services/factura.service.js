const { Factura, DetalleFactura, Producto, MovimientoInventario, sequelize } = require('../models');

const TASA_ISV = 0.15;
const ESTADOS_PERMITIDOS = ['Emitida', 'Anulada', 'Pagada'];

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

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

  static normalizarDetalles(detalles) {
    if (!Array.isArray(detalles) || detalles.length === 0) {
      throw httpError(400, 'Los detalles son obligatorios y deben tener al menos un ítem.');
    }

    return detalles.map((det, indice) => {
      const descripcion_item = String(det.descripcion_item || det.descripcion || '').trim();
      const cantidad = Number(det.cantidad);
      const precio_unitario = Number(det.precio_unitario);
      const id_producto = det.id_producto ?? det.idProducto ?? null;

      if (!descripcion_item) {
        throw httpError(400, `El detalle ${indice + 1} requiere descripcion_item.`);
      }
      if (!Number.isFinite(cantidad) || cantidad <= 0) {
        throw httpError(400, `El detalle ${indice + 1} requiere una cantidad mayor que 0.`);
      }
      if (!Number.isFinite(precio_unitario) || precio_unitario <= 0) {
        throw httpError(400, `El detalle ${indice + 1} requiere un precio_unitario mayor que 0.`);
      }

      return {
        ...det,
        descripcion_item,
        cantidad,
        precio_unitario,
        id_producto,
      };
    });
  }

  static mapearDetalles(detallesProcesados, idFactura) {
    return detallesProcesados.map((d) => ({
      id_factura: idFactura,
      id_producto: d.id_producto || null,
      descripcion_item: d.descripcion_item,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      subtotal_linea: d.subtotal_linea,
    }));
  }

  static async moverInventario({ detalles, tipoMovimiento, idUsuario, motivo, transaction }) {
    for (const det of detalles) {
      if (!det.id_producto) continue;

      const producto = await Producto.findByPk(det.id_producto, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!producto) {
        throw httpError(404, `Producto ${det.id_producto} no encontrado`);
      }
      if (producto.estado !== 'Activo') {
        throw httpError(400, 'No se pueden registrar movimientos sobre un producto inactivo');
      }

      const cantidad = Number(det.cantidad);
      const stockActual = Number(producto.stockActual);
      let nuevoStock;

      if (tipoMovimiento === 'Salida') {
        if (cantidad > stockActual) {
          throw httpError(400, 'Stock insuficiente para registrar la salida del producto');
        }
        nuevoStock = stockActual - cantidad;
      } else {
        nuevoStock = stockActual + cantidad;
      }

      await producto.update({ stockActual: nuevoStock }, { transaction });
      await MovimientoInventario.create({
        idProducto: det.id_producto,
        tipoMovimiento,
        cantidad,
        motivo,
        idUsuario,
      }, { transaction });
    }
  }

  static async crearFactura(data) {
    const transaction = await sequelize.transaction();
    try {
      const existe = await Factura.findOne({ where: { numero_factura: data.numero_factura }, transaction });
      if (existe) {
        throw httpError(409, 'El número de factura ya se encuentra registrado.');
      }

      const detallesNormalizados = this.normalizarDetalles(data.detalles);
      const { subtotal, impuestoIsv, total, detallesProcesados } = this.calcularTotales(detallesNormalizados);

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

      await DetalleFactura.bulkCreate(
        this.mapearDetalles(detallesProcesados, nuevaFactura.id_factura),
        { transaction }
      );

      await this.moverInventario({
        detalles: detallesProcesados,
        tipoMovimiento: 'Salida',
        idUsuario: data.id_usuario_emisor,
        motivo: `Salida por factura ${nuevaFactura.numero_factura}`,
        transaction,
      });

      await transaction.commit();
      return await this.obtenerFacturaPorId(nuevaFactura.id_factura);
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  static async obtenerFacturas() {
    return await Factura.findAll({ raw: true });
  }

  static async obtenerFacturaPorId(id) {
    const factura = await Factura.findByPk(id, { raw: true });
    if (!factura) {
      throw httpError(404, 'Factura no encontrada.');
    }

    const detalles = await DetalleFactura.findAll({
      where: { id_factura: id },
      raw: true
    });

    return {
      ...factura,
      detalles
    };
  }

  static async editarFactura(id, data) {
    const transaction = await sequelize.transaction();
    try {
      const factura = await Factura.findByPk(id, { transaction });
      if (!factura) {
        throw httpError(404, 'Factura no encontrada.');
      }

      if (factura.estado === 'Anulada') {
        throw httpError(400, 'No se puede editar una factura anulada.');
      }

      const hayCampos = data && (
        data.cai !== undefined ||
        data.id_tercero !== undefined ||
        data.fecha_emision !== undefined ||
        data.detalles !== undefined
      );

      if (!hayCampos) {
        throw httpError(400, 'Debe enviar al menos un campo para actualizar (cai, id_tercero, fecha_emision o detalles).');
      }

      if (data.id_tercero !== undefined) {
        const idTercero = Number(data.id_tercero);
        if (!Number.isInteger(idTercero) || idTercero <= 0) {
          throw httpError(400, 'id_tercero debe ser un entero positivo.');
        }
        factura.id_tercero = idTercero;
      }

      if (data.cai !== undefined) {
        const cai = String(data.cai).trim();
        if (!cai) {
          throw httpError(400, 'cai no puede estar vacío.');
        }
        factura.cai = cai;
      }

      if (data.fecha_emision !== undefined) {
        factura.fecha_emision = data.fecha_emision;
      }

      if (data.detalles !== undefined) {
        const detallesActuales = await DetalleFactura.findAll({
          where: { id_factura: id },
          transaction,
          raw: true,
        });

        const detallesNormalizados = this.normalizarDetalles(data.detalles);
        const { subtotal, impuestoIsv, total, detallesProcesados } = this.calcularTotales(detallesNormalizados);

        factura.subtotal = subtotal;
        factura.impuesto_isv = impuestoIsv;
        factura.total = total;

        await this.moverInventario({
          detalles: detallesActuales,
          tipoMovimiento: 'Entrada',
          idUsuario: factura.id_usuario_emisor,
          motivo: `Reverso de inventario por edición de factura ${factura.numero_factura}`,
          transaction,
        });

        await DetalleFactura.destroy({ where: { id_factura: id }, transaction });
        await DetalleFactura.bulkCreate(
          this.mapearDetalles(detallesProcesados, id),
          { transaction }
        );

        await this.moverInventario({
          detalles: detallesProcesados,
          tipoMovimiento: 'Salida',
          idUsuario: factura.id_usuario_emisor,
          motivo: `Salida por edición de factura ${factura.numero_factura}`,
          transaction,
        });
      }

      await factura.save({ transaction });
      await transaction.commit();

      return await this.obtenerFacturaPorId(id);
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  static async cambiarEstado(id, estado) {
    if (!estado || !ESTADOS_PERMITIDOS.includes(estado)) {
      throw httpError(400, `Estado inválido. Valores permitidos: ${ESTADOS_PERMITIDOS.join(', ')}`);
    }

    const transaction = await sequelize.transaction();
    try {
      const factura = await Factura.findByPk(id, { transaction });
      if (!factura) {
        throw httpError(404, 'Factura no encontrada.');
      }

      if (factura.estado === estado) {
        await transaction.commit();
        return await this.obtenerFacturaPorId(id);
      }

      if (factura.estado === 'Anulada' && estado === 'Pagada') {
        throw httpError(400, 'No se puede pasar una factura anulada a Pagada.');
      }

      const detalles = await DetalleFactura.findAll({
        where: { id_factura: id },
        transaction,
        raw: true,
      });

      const anular = estado === 'Anulada' && factura.estado !== 'Anulada';
      const reactivar = factura.estado === 'Anulada' && estado !== 'Anulada';

      if (anular) {
        await this.moverInventario({
          detalles,
          tipoMovimiento: 'Entrada',
          idUsuario: factura.id_usuario_emisor,
          motivo: `Devolución de inventario por anulación de factura ${factura.numero_factura}`,
          transaction,
        });
      }

      if (reactivar) {
        await this.moverInventario({
          detalles,
          tipoMovimiento: 'Salida',
          idUsuario: factura.id_usuario_emisor,
          motivo: `Salida de inventario por reactivación de factura ${factura.numero_factura}`,
          transaction,
        });
      }

      factura.estado = estado;
      await factura.save({ transaction });
      await transaction.commit();

      return await this.obtenerFacturaPorId(id);
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }
}

module.exports = FacturaService;
