const db = require('../models');
const ErrorNegocio = require('../utils/errorNegocio');

const ESTADOS_VALIDOS = ['Borrador', 'Publicado', 'Anulado'];

function validarDetalles(detalles) {
  if (!Array.isArray(detalles) || detalles.length === 0) {
    throw new ErrorNegocio(400, 'El asiento debe tener al menos una línea de detalle');
  }

  let totalDebe = 0;
  let totalHaber = 0;

  detalles.forEach((linea) => {
    if (!linea.idCuenta) {
      throw new ErrorNegocio(400, 'Cada línea del detalle requiere idCuenta');
    }
    const debe = Number(linea.debe) || 0;
    const haber = Number(linea.haber) || 0;
    if (debe < 0 || haber < 0) {
      throw new ErrorNegocio(400, 'Los montos no pueden ser negativos');
    }
    totalDebe += debe;
    totalHaber += haber;
  });

  if (totalDebe.toFixed(2) !== totalHaber.toFixed(2)) {
    throw new ErrorNegocio(400, 'La suma del Debe debe ser igual a la suma del Haber');
  }
}

async function validarCuentasExisten(detalles) {
  if (!db.CuentaContable) {
    return;
  }
  for (const linea of detalles) {
    const cuenta = await db.CuentaContable.findByPk(linea.idCuenta);
    if (!cuenta) {
      throw new ErrorNegocio(404, `La cuenta ${linea.idCuenta} no existe`);
    }
  }
}

async function siguienteNumeroAsiento() {
  const ultimo = await db.AsientoContable.findOne({ order: [['numeroAsiento', 'DESC']] });
  return ultimo ? ultimo.numeroAsiento + 1 : 1;
}

async function crearAsiento(datos, idUsuarioRegistro) {
  const { fechaAsiento, concepto, detalles } = datos;

  if (!fechaAsiento || !concepto) {
    throw new ErrorNegocio(400, 'fechaAsiento y concepto son obligatorios');
  }

  validarDetalles(detalles);
  await validarCuentasExisten(detalles);

  const numeroAsiento = datos.numeroAsiento || (await siguienteNumeroAsiento());

  return db.sequelize.transaction(async (t) => {
    const asiento = await db.AsientoContable.create({
      numeroAsiento,
      fechaAsiento,
      concepto,
      idUsuarioRegistro,
      estado: 'Publicado',
    }, { transaction: t });

    const lineas = detalles.map((linea) => ({
      idAsiento: asiento.idAsiento,
      idCuenta: linea.idCuenta,
      debe: Number(linea.debe) || 0,
      haber: Number(linea.haber) || 0,
    }));

    await db.DetalleAsiento.bulkCreate(lineas, { transaction: t });

    return obtenerAsientoPorId(asiento.idAsiento, t);
  });
}

async function obtenerAsientos() {
  return db.AsientoContable.findAll({
    include: [{ model: db.DetalleAsiento, as: 'detalles' }],
    order: [['numeroAsiento', 'DESC']],
  });
}

async function obtenerAsientoPorId(idAsiento, transaction) {
  const asiento = await db.AsientoContable.findByPk(idAsiento, {
    include: [{ model: db.DetalleAsiento, as: 'detalles' }],
    transaction,
  });
  if (!asiento) {
    throw new ErrorNegocio(404, 'Asiento no encontrado');
  }
  return asiento;
}

async function actualizarAsiento(idAsiento, datos) {
  const asiento = await obtenerAsientoPorId(idAsiento);

  if (asiento.estado !== 'Borrador') {
    throw new ErrorNegocio(400, 'Solo se puede editar un asiento en estado Borrador');
  }

  const { fechaAsiento, concepto, detalles } = datos;

  if (detalles) {
    validarDetalles(detalles);
    await validarCuentasExisten(detalles);
  }

  return db.sequelize.transaction(async (t) => {
    await asiento.update({
      fechaAsiento: fechaAsiento || asiento.fechaAsiento,
      concepto: concepto || asiento.concepto,
    }, { transaction: t });

    if (detalles) {
      await db.DetalleAsiento.destroy({ where: { idAsiento }, transaction: t });
      const lineas = detalles.map((linea) => ({
        idAsiento,
        idCuenta: linea.idCuenta,
        debe: Number(linea.debe) || 0,
        haber: Number(linea.haber) || 0,
      }));
      await db.DetalleAsiento.bulkCreate(lineas, { transaction: t });
    }

    return obtenerAsientoPorId(idAsiento, t);
  });
}

async function cambiarEstado(idAsiento, estado) {
  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw new ErrorNegocio(400, `Estado inválido, use uno de: ${ESTADOS_VALIDOS.join(', ')}`);
  }
  const asiento = await obtenerAsientoPorId(idAsiento);
  await asiento.update({ estado });
  return asiento;
}

module.exports = {
  crearAsiento,
  obtenerAsientos,
  obtenerAsientoPorId,
  actualizarAsiento,
  cambiarEstado,
};
