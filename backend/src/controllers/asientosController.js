const service = require('../services/asientosService');
const ErrorNegocio = require('../utils/errorNegocio');

function manejarError(error, res) {
  if (error instanceof ErrorNegocio) {
    return res.status(error.status).json({ ok: false, message: error.message, errors: error.errores });
  }
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ ok: false, message: 'El número de asiento ya existe' });
  }
  console.error(error);
  return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
}

async function listar(req, res) {
  try {
    const asientos = await service.obtenerAsientos();
    res.json({ ok: true, data: asientos });
  } catch (error) {
    manejarError(error, res);
  }
}

async function obtener(req, res) {
  try {
    const asiento = await service.obtenerAsientoPorId(req.params.id);
    res.json({ ok: true, data: asiento });
  } catch (error) {
    manejarError(error, res);
  }
}

async function crear(req, res) {
  try {
    const asiento = await service.crearAsiento(req.body, req.usuario.id);
    res.status(201).json({ ok: true, data: asiento });
  } catch (error) {
    manejarError(error, res);
  }
}

async function actualizar(req, res) {
  try {
    const asiento = await service.actualizarAsiento(req.params.id, req.body);
    res.json({ ok: true, data: asiento });
  } catch (error) {
    manejarError(error, res);
  }
}

async function cambiarEstado(req, res) {
  try {
    const asiento = await service.cambiarEstado(req.params.id, req.body.estado);
    res.json({ ok: true, data: asiento });
  } catch (error) {
    manejarError(error, res);
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  cambiarEstado,
};
