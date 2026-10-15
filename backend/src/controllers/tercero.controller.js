
const terceroService = require('../services/tercero.service');
const ErrorNegocio = require('../utils/errorNegocio');
const { UniqueConstraintError, ValidationError } = require('sequelize');

const listar = async (req, res) => {
  try {
    const terceros = await terceroService.listarTerceros({
      tipo: req.query.tipo,
      estado: req.query.estado,
      buscar: req.query.buscar,
    });

    return res.status(200).json({
      success: true,
      data: terceros,
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const tercero = await terceroService.obtenerTerceroPorId(req.params.id);

    if (!tercero) {
      return res.status(404).json({
        success: false,
        message: 'Tercero no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: tercero,
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

const crear = async (req, res) => {
  try {
    const tercero = await terceroService.crearTercero(req.body);

    return res.status(201).json({
      success: true,
      message: 'Tercero creado correctamente',
      data: tercero,
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

const actualizar = async (req, res) => {
  try {
    const tercero = await terceroService.actualizarTercero(
      req.params.id,
      req.body
    );

    if (!tercero) {
      return res.status(404).json({
        success: false,
        message: 'Tercero no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Tercero actualizado correctamente',
      data: tercero,
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

const cambiarEstado = async (req, res) => {
  try {
    const tercero = await terceroService.cambiarEstadoTercero(
      req.params.id,
      req.body.estado
    );

    if (!tercero) {
      return res.status(404).json({
        success: false,
        message: 'Tercero no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Estado del tercero actualizado correctamente',
      data: tercero,
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

const manejarError = (res, error) => {
  if (error instanceof ErrorNegocio) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
      ...(error.errores ? { errors: error.errores } : {}),
    });
  }

  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({
      success: false,
      message: 'El RTN ya está registrado',
    });
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: error.errors.map((e) => e.message),
    });
  }

  console.error('Error en módulo de terceros:', error);

  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
};

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  cambiarEstado,
};
