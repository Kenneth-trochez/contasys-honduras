import { Request, Response } from 'express';
import * as service from '../services/asientosService';
import ErrorNegocio from '../utils/errorNegocio';
import { nombreError } from '../utils/peticion';

function manejarError(error: unknown, res: Response): void {
  if (error instanceof ErrorNegocio) {
    res.status(error.status).json({ ok: false, message: error.message, errors: error.errores });
    return;
  }
  if (nombreError(error) === 'SequelizeUniqueConstraintError') {
    res.status(409).json({ ok: false, message: 'El número de asiento ya existe' });
    return;
  }
  console.error(error);
  res.status(500).json({ ok: false, message: 'Error interno del servidor' });
}

export async function listar(_req: Request, res: Response): Promise<void> {
  try {
    const asientos = await service.obtenerAsientos();
    res.json({ ok: true, data: asientos });
  } catch (error) {
    manejarError(error, res);
  }
}

export async function obtener(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const asiento = await service.obtenerAsientoPorId(req.params.id);
    res.json({ ok: true, data: asiento });
  } catch (error) {
    manejarError(error, res);
  }
}

export async function crear(req: Request, res: Response): Promise<void> {
  try {
    const idUsuarioRegistro = req.usuario ? req.usuario.id : req.body.idUsuarioRegistro;
    const asiento = await service.crearAsiento(req.body, idUsuarioRegistro);
    res.status(201).json({ ok: true, data: asiento });
  } catch (error) {
    manejarError(error, res);
  }
}

export async function actualizar(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const asiento = await service.actualizarAsiento(req.params.id, req.body);
    res.json({ ok: true, data: asiento });
  } catch (error) {
    manejarError(error, res);
  }
}

export async function cambiarEstado(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const asiento = await service.cambiarEstado(req.params.id, req.body.estado);
    res.json({ ok: true, data: asiento });
  } catch (error) {
    manejarError(error, res);
  }
}
