
const Tercero = require('../models/Tercero');
const ErrorNegocio = require('../utils/errorNegocio');
const { Op } = require('sequelize');

const TIPOS_TERCERO = ['Cliente', 'Proveedor', 'Ambos'];
const ESTADOS = ['Activo', 'Inactivo'];

const listarTerceros = async (filtros = {}) => {
  const where = {};

  if (filtros.tipo) {
    if (!TIPOS_TERCERO.includes(filtros.tipo)) {
      throw new ErrorNegocio(
        400,
        'Tipo de tercero inválido. Use Cliente, Proveedor o Ambos'
      );
    }

    where.tipo_tercero = filtros.tipo;
  }

  if (filtros.estado) {
    if (!ESTADOS.includes(filtros.estado)) {
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
    where,
    order: [['id_tercero', 'DESC']],
  });
};

const obtenerTerceroPorId = async (id) => {
  return Tercero.findByPk(id);
};

const crearTercero = async (datos) => {
  if (!datos.tipo_tercero || !TIPOS_TERCERO.includes(datos.tipo_tercero)) {
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

  if (datos.estado !== undefined && !ESTADOS.includes(datos.estado)) {
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
    estado: datos.estado || 'Activo',
  });
};

const actualizarTercero = async (id, datos) => {
  const tercero = await Tercero.findByPk(id);

  if (!tercero) {
    return null;
  }

  if (
    datos.tipo_tercero !== undefined &&
    !TIPOS_TERCERO.includes(datos.tipo_tercero)
  ) {
    throw new ErrorNegocio(
      400,
      'Tipo de tercero inválido. Use Cliente, Proveedor o Ambos'
    );
  }

  if (datos.estado !== undefined && !ESTADOS.includes(datos.estado)) {
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
    tipo_tercero: datos.tipo_tercero ?? tercero.tipo_tercero,
    nombre_razon_social:
      datos.nombre_razon_social === undefined
        ? tercero.nombre_razon_social
        : datos.nombre_razon_social.trim(),
    rtn: datos.rtn ?? tercero.rtn,
    telefono: datos.telefono ?? tercero.telefono,
    email: datos.email ?? tercero.email,
    direccion: datos.direccion ?? tercero.direccion,
  });

  return tercero;
};

const cambiarEstadoTercero = async (id, estado) => {
  if (!ESTADOS.includes(estado)) {
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

module.exports = {
  listarTerceros,
  obtenerTerceroPorId,
  crearTercero,
  actualizarTercero,
  cambiarEstadoTercero,
};
