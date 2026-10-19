import { Op, WhereOptions } from 'sequelize';
import { Tercero } from '../models';
import { TipoTercero } from '../models/Tercero';
import ErrorNegocio from '../utils/errorNegocio';
import { EstadoActivo } from '../types/comunes';

const TIPOS_TERCERO: TipoTercero[] = ['Cliente', 'Proveedor', 'Ambos'];
const ESTADOS: EstadoActivo[] = ['Activo', 'Inactivo'];

type Id = number | string;

export interface FiltrosTercero {
  tipo?: string;
  estado?: string;
  buscar?: string;
}

export interface DatosTercero {
  tipo_tercero?: unknown;
  nombre_razon_social?: unknown;
  rtn?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  estado?: unknown;
}

const esTipo = (valor: unknown): valor is TipoTercero => TIPOS_TERCERO.includes(valor as TipoTercero);
const esEstado = (valor: unknown): valor is EstadoActivo => ESTADOS.includes(valor as EstadoActivo);

export const listarTerceros = async (filtros: FiltrosTercero = {}): Promise<Tercero[]> => {
  const where: Record<string, unknown> = {};

  if (filtros.tipo) {
    if (!esTipo(filtros.tipo)) {
      throw new ErrorNegocio(
        400,
        'Tipo de tercero inválido. Use Cliente, Proveedor o Ambos'
      );
    }

    where.tipo_tercero = filtros.tipo;
  }

  if (filtros.estado) {
    if (!esEstado(filtros.estado)) {
      throw new ErrorNegocio(
        400,
        'Estado inválido. Use Activo o Inactivo'
      );
    }

    where.estado = filtros.estado;
  }

  if (filtros.buscar) {
    where.nombre_razon_social = {
      [Op.like]: `%${filtros.buscar}%`,
    };
  }

  return Tercero.findAll({
    where: where as WhereOptions<Tercero>,
    order: [['id_tercero', 'DESC']],
  });
};

export const obtenerTerceroPorId = async (id: Id): Promise<Tercero | null> => {
  return Tercero.findByPk(id);
};

export const crearTercero = async (datos: DatosTercero): Promise<Tercero> => {
  if (!datos.tipo_tercero || !esTipo(datos.tipo_tercero)) {
    throw new ErrorNegocio(
      400,
      'Tipo de tercero inválido. Use Cliente, Proveedor o Ambos'
    );
  }

  if (
    typeof datos.nombre_razon_social !== 'string' ||
    !datos.nombre_razon_social.trim()
  ) {
    throw new ErrorNegocio(
      400,
      'El nombre o razón social es obligatorio'
    );
  }

  if (datos.estado !== undefined && !esEstado(datos.estado)) {
    throw new ErrorNegocio(
      400,
      'Estado inválido. Use Activo o Inactivo'
    );
  }

  return Tercero.create({
    tipo_tercero: datos.tipo_tercero,
    nombre_razon_social: datos.nombre_razon_social.trim(),
    rtn: datos.rtn || null,
    telefono: datos.telefono || null,
    email: datos.email || null,
    direccion: datos.direccion || null,
    estado: (datos.estado as EstadoActivo | undefined) || 'Activo',
  });
};

export const actualizarTercero = async (id: Id, datos: DatosTercero): Promise<Tercero | null> => {
  const tercero = await Tercero.findByPk(id);

  if (!tercero) {
    return null;
  }

  if (
    datos.tipo_tercero !== undefined &&
    !esTipo(datos.tipo_tercero)
  ) {
    throw new ErrorNegocio(
      400,
      'Tipo de tercero inválido. Use Cliente, Proveedor o Ambos'
    );
  }

  if (datos.estado !== undefined && !esEstado(datos.estado)) {
    throw new ErrorNegocio(
      400,
      'Estado inválido. Use Activo o Inactivo'
    );
  }

  if (
    datos.nombre_razon_social !== undefined &&
    (typeof datos.nombre_razon_social !== 'string' ||
      !datos.nombre_razon_social.trim())
  ) {
    throw new ErrorNegocio(
      400,
      'El nombre o razón social no puede estar vacío'
    );
  }

  await tercero.update({
    tipo_tercero: (datos.tipo_tercero as TipoTercero | undefined) ?? tercero.tipo_tercero,
    nombre_razon_social:
      datos.nombre_razon_social === undefined
        ? tercero.nombre_razon_social
        : (datos.nombre_razon_social as string).trim(),
    rtn: datos.rtn ?? tercero.rtn,
    telefono: datos.telefono ?? tercero.telefono,
    email: datos.email ?? tercero.email,
    direccion: datos.direccion ?? tercero.direccion,
  });

  return tercero;
};

export const cambiarEstadoTercero = async (id: Id, estado: unknown): Promise<Tercero | null> => {
  if (!esEstado(estado)) {
    throw new ErrorNegocio(
      400,
      'Estado inválido. Use Activo o Inactivo'
    );
  }

  const tercero = await Tercero.findByPk(id);

  if (!tercero) {
    return null;
  }

  await tercero.update({ estado });

  return tercero;
};
