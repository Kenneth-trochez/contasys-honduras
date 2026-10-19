import { Op, WhereOptions } from 'sequelize';
import db from '../models';
import { MovimientoInventario, TipoMovimiento } from '../models/MovimientoInventario';
import { Producto } from '../models/Producto';
import ErrorNegocio from '../utils/errorNegocio';
import { Decimal, EstadoActivo } from '../types/comunes';

const ESTADOS_PRODUCTO: EstadoActivo[] = ['Activo', 'Inactivo'];
const TIPOS_MOVIMIENTO: TipoMovimiento[] = ['Entrada', 'Salida', 'Ajuste'];

type Id = number | string;

export interface DatosProducto {
  codigoProducto?: string;
  nombreProducto?: string;
  descripcion?: string | null;
  precioCompra?: Decimal;
  precioVenta?: Decimal;
  stockMinimo?: Decimal;
}

export interface DatosMovimiento {
  idProducto?: number;
  cantidad?: Decimal;
  motivo?: string | null;
}

export interface FiltrosProducto {
  q?: string;
  estado?: string;
}

export interface FiltrosMovimiento {
  idProducto?: string;
  tipoMovimiento?: string;
}

export interface ResultadoMovimiento {
  movimiento: MovimientoInventario;
  producto: Producto | null;
}

// ---------- Productos ----------

export async function listarProductos(filtros: FiltrosProducto = {}): Promise<Producto[]> {
  const where: Record<string | symbol, unknown> = {};
  if (filtros.estado) {
    where.estado = filtros.estado;
  }
  if (filtros.q) {
    where[Op.or] = [
      { nombreProducto: { [Op.like]: `%${filtros.q}%` } },
      { codigoProducto: { [Op.like]: `%${filtros.q}%` } },
    ];
  }
  return db.Producto.findAll({ where: where as WhereOptions<Producto>, order: [['nombreProducto', 'ASC']] });
}

export async function obtenerProductoPorId(idProducto: Id): Promise<Producto> {
  const producto = await db.Producto.findByPk(idProducto);
  if (!producto) {
    throw new ErrorNegocio(404, 'Producto no encontrado');
  }
  return producto;
}

function validarDatosProducto(datos: DatosProducto, { esCreacion }: { esCreacion: boolean }): void {
  if (esCreacion && !datos.codigoProducto) {
    throw new ErrorNegocio(400, 'codigoProducto es obligatorio');
  }
  if (esCreacion && !datos.nombreProducto) {
    throw new ErrorNegocio(400, 'nombreProducto es obligatorio');
  }
  if (datos.precioVenta !== undefined && Number(datos.precioVenta) <= 0) {
    throw new ErrorNegocio(400, 'precioVenta debe ser mayor que 0');
  }
  if (esCreacion && datos.precioVenta === undefined) {
    throw new ErrorNegocio(400, 'precioVenta es obligatorio');
  }
}

export async function crearProducto(datos: DatosProducto): Promise<Producto> {
  validarDatosProducto(datos, { esCreacion: true });

  return db.Producto.create({
    codigoProducto: datos.codigoProducto as string,
    nombreProducto: datos.nombreProducto as string,
    descripcion: datos.descripcion || null,
    precioCompra: datos.precioCompra || 0,
    precioVenta: datos.precioVenta as Decimal,
    stockActual: 0,
    stockMinimo: datos.stockMinimo || 0,
    estado: 'Activo',
  });
}

export async function actualizarProducto(idProducto: Id, datos: DatosProducto): Promise<Producto> {
  const producto = await obtenerProductoPorId(idProducto);
  validarDatosProducto(datos, { esCreacion: false });

  await producto.update({
    nombreProducto: datos.nombreProducto ?? producto.nombreProducto,
    descripcion: datos.descripcion ?? producto.descripcion,
    precioCompra: datos.precioCompra ?? producto.precioCompra,
    precioVenta: datos.precioVenta ?? producto.precioVenta,
    stockMinimo: datos.stockMinimo ?? producto.stockMinimo,
    // codigoProducto y stockActual no se editan aquí a propósito:
    // el código es la identidad del producto, y el stock solo cambia por movimientos.
  });

  return producto;
}

export async function cambiarEstadoProducto(idProducto: Id, estado: unknown): Promise<Producto> {
  if (!ESTADOS_PRODUCTO.includes(estado as EstadoActivo)) {
    throw new ErrorNegocio(400, `Estado inválido, use uno de: ${ESTADOS_PRODUCTO.join(', ')}`);
  }
  const producto = await obtenerProductoPorId(idProducto);
  await producto.update({ estado: estado as EstadoActivo });
  return producto;
}

// ---------- Movimientos de inventario ----------

async function aplicarMovimiento(
  tipoMovimiento: TipoMovimiento,
  datos: DatosMovimiento,
  idUsuario: number | undefined
): Promise<ResultadoMovimiento> {
  if (!TIPOS_MOVIMIENTO.includes(tipoMovimiento)) {
    throw new ErrorNegocio(400, `tipoMovimiento inválido, use uno de: ${TIPOS_MOVIMIENTO.join(', ')}`);
  }
  const idProducto = datos.idProducto;
  if (!idProducto) {
    throw new ErrorNegocio(400, 'idProducto es obligatorio');
  }
  if (!idUsuario) {
    throw new ErrorNegocio(400, 'idUsuario es obligatorio');
  }

  const cantidad = Number(datos.cantidad);
  if (!cantidad || Number.isNaN(cantidad)) {
    throw new ErrorNegocio(400, 'cantidad es obligatoria y debe ser un número distinto de 0');
  }
  if (tipoMovimiento !== 'Ajuste' && cantidad <= 0) {
    throw new ErrorNegocio(400, 'cantidad debe ser mayor que 0 para Entrada o Salida');
  }

  return db.sequelize.transaction(async (t) => {
    const producto = await db.Producto.findByPk(idProducto, { transaction: t, lock: t.LOCK.UPDATE });
    if (!producto) {
      throw new ErrorNegocio(404, 'Producto no encontrado');
    }
    if (producto.estado !== 'Activo') {
      throw new ErrorNegocio(400, 'No se pueden registrar movimientos sobre un producto inactivo');
    }

    const stockActual = Number(producto.stockActual);
    let nuevoStock: number;

    if (tipoMovimiento === 'Entrada') {
      nuevoStock = stockActual + cantidad;
    } else if (tipoMovimiento === 'Salida') {
      if (cantidad > stockActual) {
        throw new ErrorNegocio(400, 'Stock insuficiente para registrar la salida');
      }
      nuevoStock = stockActual - cantidad;
    } else {
      // Ajuste: cantidad puede ser positiva o negativa
      nuevoStock = stockActual + cantidad;
      if (nuevoStock < 0) {
        throw new ErrorNegocio(400, 'El ajuste dejaría el stock en negativo');
      }
    }

    await producto.update({ stockActual: nuevoStock }, { transaction: t });

    const movimiento = await db.MovimientoInventario.create({
      idProducto,
      tipoMovimiento,
      cantidad,
      motivo: datos.motivo || null,
      idUsuario,
    }, { transaction: t });

    return {
      movimiento,
      producto: await db.Producto.findByPk(idProducto, { transaction: t }),
    };
  });
}

export async function registrarEntrada(datos: DatosMovimiento, idUsuario: number | undefined): Promise<ResultadoMovimiento> {
  return aplicarMovimiento('Entrada', datos, idUsuario);
}

export async function registrarSalida(datos: DatosMovimiento, idUsuario: number | undefined): Promise<ResultadoMovimiento> {
  return aplicarMovimiento('Salida', datos, idUsuario);
}

export async function registrarAjuste(datos: DatosMovimiento, idUsuario: number | undefined): Promise<ResultadoMovimiento> {
  return aplicarMovimiento('Ajuste', datos, idUsuario);
}

export async function listarMovimientos(filtros: FiltrosMovimiento = {}): Promise<MovimientoInventario[]> {
  const where: Record<string, unknown> = {};
  if (filtros.idProducto) {
    where.idProducto = filtros.idProducto;
  }
  if (filtros.tipoMovimiento) {
    where.tipoMovimiento = filtros.tipoMovimiento;
  }
  return db.MovimientoInventario.findAll({
    where: where as WhereOptions<MovimientoInventario>,
    include: [{ model: db.Producto, as: 'producto' }],
    order: [['fechaMovimiento', 'DESC']],
  });
}
