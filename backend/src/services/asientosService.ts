import { Transaction } from 'sequelize';
import db from '../models';
import { AsientoContable, EstadoAsiento } from '../models/AsientoContable';
import ErrorNegocio from '../utils/errorNegocio';
import { validarCuentaParaMovimiento } from './cuentas.service';

const ESTADOS_VALIDOS: EstadoAsiento[] = ['Borrador', 'Publicado', 'Anulado'];

export interface LineaAsientoEntrada {
  idCuenta?: number;
  debe?: number | string;
  haber?: number | string;
}

export interface DatosAsiento {
  numeroAsiento?: number;
  fechaAsiento?: string;
  concepto?: string;
  detalles?: LineaAsientoEntrada[];
}

type Id = number | string;

function validarDetalles(detalles: unknown): asserts detalles is LineaAsientoEntrada[] {
  if (!Array.isArray(detalles) || detalles.length === 0) {
    throw new ErrorNegocio(400, 'El asiento debe tener al menos una línea de detalle');
  }

  let totalDebe = 0;
  let totalHaber = 0;

  (detalles as LineaAsientoEntrada[]).forEach((linea) => {
    if (!linea.idCuenta) {
      throw new ErrorNegocio(400, 'Cada línea del detalle requiere idCuenta');
    }
    const debe = Number(linea.debe) || 0;
    const haber = Number(linea.haber) || 0;
    if (debe < 0 || haber < 0) {
      throw new ErrorNegocio(400, 'Los montos no pueden ser negativos');
    }
    if (debe > 0 && haber > 0) {
      throw new ErrorNegocio(400, 'Una línea de detalle no puede tener Debe y Haber a la vez');
    }
    if (debe === 0 && haber === 0) {
      throw new ErrorNegocio(400, 'Una línea de detalle debe tener un monto en Debe o en Haber');
    }
    totalDebe += debe;
    totalHaber += haber;
  });

  if (totalDebe.toFixed(2) !== totalHaber.toFixed(2)) {
    throw new ErrorNegocio(400, 'La suma del Debe debe ser igual a la suma del Haber');
  }
}

async function validarCuentasParaMovimiento(detalles: LineaAsientoEntrada[]): Promise<void> {
  const idsCuenta = [...new Set(detalles.map((linea) => linea.idCuenta))];
  for (const idCuenta of idsCuenta) {
    await validarCuentaParaMovimiento(idCuenta as number);
  }
}

async function siguienteNumeroAsiento(): Promise<number> {
  const ultimo = await db.AsientoContable.findOne({ order: [['numeroAsiento', 'DESC']] });
  return ultimo ? ultimo.numeroAsiento + 1 : 1;
}

function lineasParaGuardar(idAsiento: number, detalles: LineaAsientoEntrada[]) {
  return detalles.map((linea) => ({
    idAsiento,
    idCuenta: linea.idCuenta as number,
    debe: Number(linea.debe) || 0,
    haber: Number(linea.haber) || 0,
  }));
}

export async function crearAsiento(datos: DatosAsiento, idUsuarioRegistro: number | undefined): Promise<AsientoContable> {
  const { fechaAsiento, concepto, detalles } = datos;

  if (!fechaAsiento || !concepto) {
    throw new ErrorNegocio(400, 'fechaAsiento y concepto son obligatorios');
  }

  if (!idUsuarioRegistro) {
    throw new ErrorNegocio(400, 'idUsuarioRegistro es obligatorio');
  }

  validarDetalles(detalles);
  await validarCuentasParaMovimiento(detalles);

  const numeroAsiento = datos.numeroAsiento || (await siguienteNumeroAsiento());

  return db.sequelize.transaction(async (t) => {
    const asiento = await db.AsientoContable.create({
      numeroAsiento,
      fechaAsiento,
      concepto,
      idUsuarioRegistro,
      estado: 'Publicado',
    }, { transaction: t });

    await db.DetalleAsiento.bulkCreate(lineasParaGuardar(asiento.idAsiento, detalles), { transaction: t });

    return obtenerAsientoPorId(asiento.idAsiento, t);
  });
}

export async function obtenerAsientos(): Promise<AsientoContable[]> {
  return db.AsientoContable.findAll({
    include: [{ model: db.DetalleAsiento, as: 'detalles' }],
    order: [['numeroAsiento', 'DESC']],
  });
}

export async function obtenerAsientoPorId(idAsiento: Id, transaction?: Transaction): Promise<AsientoContable> {
  const asiento = await db.AsientoContable.findByPk(idAsiento, {
    include: [{ model: db.DetalleAsiento, as: 'detalles' }],
    transaction,
  });
  if (!asiento) {
    throw new ErrorNegocio(404, 'Asiento no encontrado');
  }
  return asiento;
}

export async function actualizarAsiento(idAsiento: Id, datos: DatosAsiento): Promise<AsientoContable> {
  const asiento = await obtenerAsientoPorId(idAsiento);

  if (asiento.estado !== 'Borrador') {
    throw new ErrorNegocio(400, 'Solo se puede editar un asiento en estado Borrador');
  }

  const { fechaAsiento, concepto, detalles } = datos;

  if (detalles) {
    validarDetalles(detalles);
    await validarCuentasParaMovimiento(detalles);
  }

  return db.sequelize.transaction(async (t) => {
    await asiento.update({
      fechaAsiento: fechaAsiento || asiento.fechaAsiento,
      concepto: concepto || asiento.concepto,
    }, { transaction: t });

    if (detalles) {
      await db.DetalleAsiento.destroy({ where: { idAsiento: idAsiento as number }, transaction: t });
      await db.DetalleAsiento.bulkCreate(lineasParaGuardar(idAsiento as number, detalles), { transaction: t });
    }

    return obtenerAsientoPorId(idAsiento, t);
  });
}

export async function cambiarEstado(idAsiento: Id, estado: unknown): Promise<AsientoContable> {
  if (!ESTADOS_VALIDOS.includes(estado as EstadoAsiento)) {
    throw new ErrorNegocio(400, `Estado inválido, use uno de: ${ESTADOS_VALIDOS.join(', ')}`);
  }
  const asiento = await obtenerAsientoPorId(idAsiento);
  await asiento.update({ estado: estado as EstadoAsiento });
  return asiento;
}
