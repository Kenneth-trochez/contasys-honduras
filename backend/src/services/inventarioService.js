const db = require('../models');
const ErrorNegocio = require('../utils/errorNegocio');

const ESTADOS_PRODUCTO = ['Activo', 'Inactivo'];
const TIPOS_MOVIMIENTO = ['Entrada', 'Salida', 'Ajuste'];

// ---------- Productos ----------

async function listarProductos(filtros = {}) {
  const where = {};
  if (filtros.estado) {
    where.estado = filtros.estado;
  }
  if (filtros.q) {
    const { Op } = db.Sequelize;
    where[Op.or] = [
      { nombreProducto: { [Op.like]: `%${filtros.q}%` } },
      { codigoProducto: { [Op.like]: `%${filtros.q}%` } },
    ];
  }
  return db.Producto.findAll({ where, order: [['nombreProducto', 'ASC']] });
}

async function obtenerProductoPorId(idProducto) {
  const producto = await db.Producto.findByPk(idProducto);
  if (!producto) {
    throw new ErrorNegocio(404, 'Producto no encontrado');
  }
  return producto;
}

function validarDatosProducto(datos, { esCreacion }) {
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

async function crearProducto(datos) {
  validarDatosProducto(datos, { esCreacion: true });

  return db.Producto.create({
    codigoProducto: datos.codigoProducto,
    nombreProducto: datos.nombreProducto,
    descripcion: datos.descripcion || null,
    precioCompra: datos.precioCompra || 0,
    precioVenta: datos.precioVenta,
    stockActual: 0,
    stockMinimo: datos.stockMinimo || 0,
    estado: 'Activo',
  });
}

async function actualizarProducto(idProducto, datos) {
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

async function cambiarEstadoProducto(idProducto, estado) {
  if (!ESTADOS_PRODUCTO.includes(estado)) {
    throw new ErrorNegocio(400, `Estado inválido, use uno de: ${ESTADOS_PRODUCTO.join(', ')}`);
  }
  const producto = await obtenerProductoPorId(idProducto);
  await producto.update({ estado });
  return producto;
}

// ---------- Movimientos de inventario ----------

async function aplicarMovimiento(tipoMovimiento, datos, idUsuario) {
  if (!TIPOS_MOVIMIENTO.includes(tipoMovimiento)) {
    throw new ErrorNegocio(400, `tipoMovimiento inválido, use uno de: ${TIPOS_MOVIMIENTO.join(', ')}`);
  }
  if (!datos.idProducto) {
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
    const producto = await db.Producto.findByPk(datos.idProducto, { transaction: t, lock: t.LOCK.UPDATE });
    if (!producto) {
      throw new ErrorNegocio(404, 'Producto no encontrado');
    }
    if (producto.estado !== 'Activo') {
      throw new ErrorNegocio(400, 'No se pueden registrar movimientos sobre un producto inactivo');
    }

    const stockActual = Number(producto.stockActual);
    let nuevoStock;

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
      idProducto: datos.idProducto,
      tipoMovimiento,
      cantidad,
      motivo: datos.motivo || null,
      idUsuario,
    }, { transaction: t });

    return {
      movimiento,
      producto: await db.Producto.findByPk(datos.idProducto, { transaction: t }),
    };
  });
}

async function registrarEntrada(datos, idUsuario) {
  return aplicarMovimiento('Entrada', datos, idUsuario);
}

async function registrarSalida(datos, idUsuario) {
  return aplicarMovimiento('Salida', datos, idUsuario);
}

async function registrarAjuste(datos, idUsuario) {
  return aplicarMovimiento('Ajuste', datos, idUsuario);
}

async function listarMovimientos(filtros = {}) {
  const where = {};
  if (filtros.idProducto) {
    where.idProducto = filtros.idProducto;
  }
  if (filtros.tipoMovimiento) {
    where.tipoMovimiento = filtros.tipoMovimiento;
  }
  return db.MovimientoInventario.findAll({
    where,
    include: [{ model: db.Producto, as: 'producto' }],
    order: [['fechaMovimiento', 'DESC']],
  });
}

module.exports = {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  cambiarEstadoProducto,
  registrarEntrada,
  registrarSalida,
  registrarAjuste,
  listarMovimientos,
};
