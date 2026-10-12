
const Tercero = require('../models/Tercero');

const listarTerceros = async (filtros = {}) => {
  const where = {};

  if (filtros.tipo) {
    where.tipo_tercero = filtros.tipo;
  }

  if (filtros.estado) {
    where.estado = filtros.estado;
  }

  if (filtros.buscar) {
    where.nombre_razon_social = {
      [require('sequelize').Op.like]: `%${filtros.buscar}%`,
    };
  }

  return await Tercero.findAll({
    where,
    order: [['id_tercero', 'DESC']],
  });
};

const obtenerTerceroPorId = async (id) => {
  return await Tercero.findByPk(id);
};

const crearTercero = async (datos) => {
  return await Tercero.create({
    tipo_tercero: datos.tipo_tercero,
    nombre_razon_social: datos.nombre_razon_social,
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

  await tercero.update({
    tipo_tercero: datos.tipo_tercero ?? tercero.tipo_tercero,
    nombre_razon_social:
      datos.nombre_razon_social ?? tercero.nombre_razon_social,
    rtn: datos.rtn ?? tercero.rtn,
    telefono: datos.telefono ?? tercero.telefono,
    email: datos.email ?? tercero.email,
    direccion: datos.direccion ?? tercero.direccion,
  });

  return tercero;
};

const cambiarEstadoTercero = async (id, estado) => {
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
