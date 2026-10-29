import { Request, Response } from 'express';
import * as service from '../services/inventarioService';
import { guardarImagenProducto } from '../services/imagenProductoService';
import ErrorNegocio from '../utils/errorNegocio';
import { nombreError, textoQuery } from '../utils/peticion';

function manejarError(error: unknown, res: Response): void {
  if (error instanceof ErrorNegocio) {
    res.status(error.status).json({ ok: false, message: error.message, errors: error.errores });
    return;
  }
  if (nombreError(error) === 'SequelizeUniqueConstraintError') {
    res.status(409).json({ ok: false, message: 'El código de producto ya existe' });
    return;
  }
  console.error(error);
  res.status(500).json({ ok: false, message: 'Error interno del servidor' });
}

// ---------- Productos ----------

export async function listarProductos(req: Request, res: Response): Promise<void> {
  try {
    const productos = await service.listarProductos({ q: textoQuery(req.query.q), estado: textoQuery(req.query.estado) });
    res.json({ ok: true, data: productos });
  } catch (error) {
    manejarError(error, res);
  }
}

export async function obtenerProducto(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const producto = await service.obtenerProductoPorId(req.params.id);
    res.json({ ok: true, data: producto });
  } catch (error) {
    manejarError(error, res);
  }
}

export async function crearProducto(req: Request, res: Response): Promise<void> {
  try {
    const producto = await service.crearProducto(req.body);
    res.status(201).json({ ok: true, data: producto });
  } catch (error) {
    manejarError(error, res);
  }
}

export async function actualizarProducto(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const producto = await service.actualizarProducto(req.params.id, req.body);
    res.json({ ok: true, data: producto });
  } catch (error) {
    manejarError(error, res);
  }
}

export async function cambiarEstadoProducto(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const producto = await service.cambiarEstadoProducto(req.params.id, req.body.estado);
    res.json({ ok: true, data: producto });
  } catch (error) {
    manejarError(error, res);
  }
}

// POST /api/productos/:id/imagen (multipart/form-data, campo "imagen")
export async function subirImagenProducto(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const resultado = await guardarImagenProducto(req.params.id, req.file);
    res.status(201).json({ ok: true, data: resultado.producto, imagen: resultado.imagen });
  } catch (error) {
    manejarError(error, res);
  }
}

// ---------- Movimientos ----------

function idUsuarioDesdeRequest(req: Request): number | undefined {
  // Mientras no exista el middleware de autenticación (módulo de Oscar),
  // se acepta idUsuario en el body para poder probar el endpoint.
  return req.usuario ? req.usuario.id : req.body.idUsuario;
}

export async function registrarEntrada(req: Request, res: Response): Promise<void> {
  try {
    const resultado = await service.registrarEntrada(req.body, idUsuarioDesdeRequest(req));
    res.status(201).json({ ok: true, data: resultado });
  } catch (error) {
    manejarError(error, res);
  }
}

export async function registrarSalida(req: Request, res: Response): Promise<void> {
  try {
    const resultado = await service.registrarSalida(req.body, idUsuarioDesdeRequest(req));
    res.status(201).json({ ok: true, data: resultado });
  } catch (error) {
    manejarError(error, res);
  }
}

export async function registrarAjuste(req: Request, res: Response): Promise<void> {
  try {
    const resultado = await service.registrarAjuste(req.body, idUsuarioDesdeRequest(req));
    res.status(201).json({ ok: true, data: resultado });
  } catch (error) {
    manejarError(error, res);
  }
}

export async function listarMovimientos(req: Request, res: Response): Promise<void> {
  try {
    const movimientos = await service.listarMovimientos({
      idProducto: textoQuery(req.query.idProducto),
      tipoMovimiento: textoQuery(req.query.tipo),
    });
    res.json({ ok: true, data: movimientos });
  } catch (error) {
    manejarError(error, res);
  }
}
