const service = require('../services/inventarioService');
const ErrorNegocio = require('../utils/errorNegocio');

function manejarError(error, res) {
  if (error instanceof ErrorNegocio) {
    return res.status(error.status).json({ ok: false, message: error.message, errors: error.errores });
  }
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ ok: false, message: 'El código de producto ya existe' });
  }
  console.error(error);
  return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
}

// ---------- Productos ----------

async function listarProductos(req, res) {
  try {
    const productos = await service.listarProductos({ q: req.query.q, estado: req.query.estado });
    res.json({ ok: true, data: productos });
  } catch (error) {
    manejarError(error, res);
  }
}

async function obtenerProducto(req, res) {
  try {
    const producto = await service.obtenerProductoPorId(req.params.id);
    res.json({ ok: true, data: producto });
  } catch (error) {
    manejarError(error, res);
  }
}

async function crearProducto(req, res) {
  try {
    const producto = await service.crearProducto(req.body);
    res.status(201).json({ ok: true, data: producto });
  } catch (error) {
    manejarError(error, res);
  }
}

async function actualizarProducto(req, res) {
  try {
    const producto = await service.actualizarProducto(req.params.id, req.body);
    res.json({ ok: true, data: producto });
  } catch (error) {
    manejarError(error, res);
  }
}

async function cambiarEstadoProducto(req, res) {
  try {
    const producto = await service.cambiarEstadoProducto(req.params.id, req.body.estado);
    res.json({ ok: true, data: producto });
  } catch (error) {
    manejarError(error, res);
  }
}

// ---------- Movimientos ----------

function idUsuarioDesdeRequest(req) {
  // Mientras no exista el middleware de autenticación (módulo de Oscar),
  // se acepta idUsuario en el body para poder probar el endpoint.
  return req.usuario ? req.usuario.id : req.body.idUsuario;
}

async function registrarEntrada(req, res) {
  try {
    const resultado = await service.registrarEntrada(req.body, idUsuarioDesdeRequest(req));
    res.status(201).json({ ok: true, data: resultado });
  } catch (error) {
    manejarError(error, res);
  }
}

async function registrarSalida(req, res) {
  try {
    const resultado = await service.registrarSalida(req.body, idUsuarioDesdeRequest(req));
    res.status(201).json({ ok: true, data: resultado });
  } catch (error) {
    manejarError(error, res);
  }
}

async function registrarAjuste(req, res) {
  try {
    const resultado = await service.registrarAjuste(req.body, idUsuarioDesdeRequest(req));
    res.status(201).json({ ok: true, data: resultado });
  } catch (error) {
    manejarError(error, res);
  }
}

async function listarMovimientos(req, res) {
  try {
    const movimientos = await service.listarMovimientos({
      idProducto: req.query.idProducto,
      tipoMovimiento: req.query.tipo,
    });
    res.json({ ok: true, data: movimientos });
  } catch (error) {
    manejarError(error, res);
  }
}

module.exports = {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  cambiarEstadoProducto,
  registrarEntrada,
  registrarSalida,
  registrarAjuste,
  listarMovimientos,
};
