const ErrorNegocio = require('../utils/errorNegocio');
const cuentasService = require('../services/cuentas.service');
const validator = require('../validators/cuentas.validator');

const manejarError = (error, res) => {
  if (error instanceof ErrorNegocio) {
    return res.status(error.status).json({
      ok: false,
      mensaje: error.message,
      errores: error.errores,
    });
  }
  console.error(error);
  return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
};

const listar = async (req, res) => {
  try {
    const cuentas = await cuentasService.listarCuentas(req.query);
    res.status(200).json({ ok: true, data: cuentas });
  } catch (error) {
    manejarError(error, res);
  }
};

const obtener = async (req, res) => {
  try {
    validator.validarId(req.params.id);
    const cuenta = await cuentasService.obtenerCuentaPorId(req.params.id);
    res.status(200).json({ ok: true, data: cuenta });
  } catch (error) {
    manejarError(error, res);
  }
};

const crear = async (req, res) => {
  try {
    validator.validarDatosCuenta(req.body);
    const cuenta = await cuentasService.crearCuenta(req.body);
    res.status(201).json({ ok: true, mensaje: 'Cuenta creada correctamente', data: cuenta });
  } catch (error) {
    manejarError(error, res);
  }
};

const actualizar = async (req, res) => {
  try {
    validator.validarId(req.params.id);
    validator.validarDatosCuenta(req.body, { parcial: true });
    const cuenta = await cuentasService.actualizarCuenta(req.params.id, req.body);
    res.status(200).json({ ok: true, mensaje: 'Cuenta actualizada correctamente', data: cuenta });
  } catch (error) {
    manejarError(error, res);
  }
};

const cambiarEstado = async (req, res) => {
  try {
    validator.validarId(req.params.id);
    validator.validarEstado(req.body.estado);
    const cuenta = await cuentasService.cambiarEstadoCuenta(req.params.id, req.body.estado);
    res.status(200).json({ ok: true, mensaje: 'Estado actualizado correctamente', data: cuenta });
  } catch (error) {
    manejarError(error, res);
  }
};

module.exports = { listar, obtener, crear, actualizar, cambiarEstado };