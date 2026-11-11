import { Transaction } from 'sequelize';
import { Factura, DetalleFactura, Producto, MovimientoInventario, Tercero, sequelize } from '../models';
import { EstadoFactura } from '../models/Factura';
import { httpError } from '../utils/httpError';
import { Decimal } from '../types/comunes';

const TASA_ISV = 0.15;
const ESTADOS_PERMITIDOS: EstadoFactura[] = ['Emitida', 'Anulada', 'Pagada'];

type Id = number | string;

// Línea de detalle tal como llega en el body.
export interface DetalleEntrada {
  id_producto?: number | null;
  idProducto?: number | null;
  descripcion_item?: string;
  descripcion?: string;
  cantidad?: Decimal;
  precio_unitario?: Decimal;
  [campo: string]: unknown;
}

// Línea ya validada y con números.
export interface DetalleNormalizado extends DetalleEntrada {
  descripcion_item: string;
  cantidad: number;
  precio_unitario: number;
  id_producto: number | null;
}

export interface DetalleProcesado extends DetalleNormalizado {
  subtotal_linea: number;
}

export interface DatosFactura {
  numero_factura?: string;
  cai?: string;
  fecha_emision?: string | Date;
  id_tercero?: number;
  id_usuario_emisor?: number;
  detalles?: unknown;
}

export interface DatosEdicionFactura {
  cai?: unknown;
  id_tercero?: unknown;
  fecha_emision?: string | Date;
  detalles?: unknown;
}

// Línea mínima que necesita moverInventario (procesada o leída de la base).
interface LineaInventario {
  id_producto: number | null;
  cantidad: Decimal;
}

interface MovimientoFactura {
  detalles: LineaInventario[];
  tipoMovimiento: 'Entrada' | 'Salida';
  idUsuario: number;
  motivo: string;
  transaction: Transaction;
}

export type FacturaConDetalles = Record<string, unknown> & { detalles: DetalleFactura[] };

class FacturaService {

  static calcularTotales(detalles: DetalleNormalizado[]) {
    let subtotal = 0;
    const detallesProcesados: DetalleProcesado[] = detalles.map(det => {
      const subtotalLinea = Number((det.cantidad * det.precio_unitario).toFixed(2));
      subtotal += subtotalLinea;
      return { ...det, subtotal_linea: subtotalLinea };
    });

    const impuestoIsv = Number((subtotal * TASA_ISV).toFixed(2));
    const total = Number((subtotal + impuestoIsv).toFixed(2));

    return { subtotal, impuestoIsv, total, detallesProcesados };
  }

  static normalizarDetalles(detalles: unknown): DetalleNormalizado[] {
    if (!Array.isArray(detalles) || detalles.length === 0) {
      throw httpError(400, 'Los detalles son obligatorios y deben tener al menos un ítem.');
    }

    return (detalles as DetalleEntrada[]).map((det, indice) => {
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

  static mapearDetalles(detallesProcesados: DetalleProcesado[], idFactura: number) {
    return detallesProcesados.map((d) => ({
      id_factura: idFactura,
      id_producto: d.id_producto || null,
      descripcion_item: d.descripcion_item,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      subtotal_linea: d.subtotal_linea,
    }));
  }

  static async moverInventario({ detalles, tipoMovimiento, idUsuario, motivo, transaction }: MovimientoFactura): Promise<void> {
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
      let nuevoStock: number;

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

  static async crearFactura(data: DatosFactura): Promise<FacturaConDetalles> {
    const transaction = await sequelize.transaction();
    try {
      const existe = await Factura.findOne({ where: { numero_factura: data.numero_factura as string }, transaction });
      if (existe) {
        throw httpError(409, 'El número de factura ya se encuentra registrado.');
      }

      const tercero = await Tercero.findByPk(data.id_tercero as number, { transaction });
      if (!tercero || tercero.estado !== 'Activo') {
        throw httpError(404, 'Tercero no encontrado o inactivo.');
      }

      const detallesNormalizados = this.normalizarDetalles(data.detalles);
      const { subtotal, impuestoIsv, total, detallesProcesados } = this.calcularTotales(detallesNormalizados);

      const nuevaFactura = await Factura.create({
        numero_factura: data.numero_factura as string,
        cai: data.cai as string,
        fecha_emision: data.fecha_emision || new Date(),
        id_tercero: data.id_tercero as number,
        id_usuario_emisor: data.id_usuario_emisor as number,
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
        idUsuario: data.id_usuario_emisor as number,
        motivo: `Salida por factura ${nuevaFactura.numero_factura}`,
        transaction,
      });

      await transaction.commit();
      return await this.obtenerFacturaPorId(nuevaFactura.id_factura);
    } catch (error) {
      await FacturaService.revertir(transaction);
      throw error;
    }
  }

  static async obtenerFacturas(): Promise<Factura[]> {
    return await Factura.findAll({ raw: true });
  }

  static async obtenerFacturaPorId(id: Id): Promise<FacturaConDetalles> {
    const factura = await Factura.findByPk(id, { raw: true });
    if (!factura) {
      throw httpError(404, 'Factura no encontrada.');
    }

    const detalles = await DetalleFactura.findAll({
      where: { id_factura: id as number },
      raw: true
    });

    return {
      ...(factura as unknown as Record<string, unknown>),
      detalles
    };
  }

  static async editarFactura(id: Id, data: DatosEdicionFactura): Promise<FacturaConDetalles> {
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
          where: { id_factura: id as number },
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

        await DetalleFactura.destroy({ where: { id_factura: id as number }, transaction });
        await DetalleFactura.bulkCreate(
          this.mapearDetalles(detallesProcesados, id as number),
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
      await FacturaService.revertir(transaction);
      throw error;
    }
  }

  static async cambiarEstado(id: Id, estado: unknown): Promise<FacturaConDetalles> {
    if (!estado || !ESTADOS_PERMITIDOS.includes(estado as EstadoFactura)) {
      throw httpError(400, `Estado inválido. Valores permitidos: ${ESTADOS_PERMITIDOS.join(', ')}`);
    }
    const nuevoEstado = estado as EstadoFactura;

    const transaction = await sequelize.transaction();
    try {
      const factura = await Factura.findByPk(id, { transaction });
      if (!factura) {
        throw httpError(404, 'Factura no encontrada.');
      }

      if (factura.estado === nuevoEstado) {
        await transaction.commit();
        return await this.obtenerFacturaPorId(id);
      }

      if (factura.estado === 'Anulada' && nuevoEstado === 'Pagada') {
        throw httpError(400, 'No se puede pasar una factura anulada a Pagada.');
      }

      const detalles = await DetalleFactura.findAll({
        where: { id_factura: id as number },
        transaction,
        raw: true,
      });

      const anular = nuevoEstado === 'Anulada' && factura.estado !== 'Anulada';
      const reactivar = factura.estado === 'Anulada' && nuevoEstado !== 'Anulada';

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

      factura.estado = nuevoEstado;
      await factura.save({ transaction });
      await transaction.commit();

      return await this.obtenerFacturaPorId(id);
    } catch (error) {
      await FacturaService.revertir(transaction);
      throw error;
    }
  }

  // Deshace la transacción si todavía está abierta.
  private static async revertir(transaction: Transaction): Promise<void> {
    if (transaction && !(transaction as Transaction & { finished?: string }).finished) {
      await transaction.rollback();
    }
  }
}

export default FacturaService;
