import { Request, Response } from 'express';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import * as terceroService from '../services/tercero.service';
import ErrorNegocio from '../utils/errorNegocio';
import { textoQuery } from '../utils/peticion';

export const listar = async (req: Request, res: Response): Promise<void> => {
  try {
    const terceros = await terceroService.listarTerceros({
      tipo: textoQuery(req.query.tipo),
      estado: textoQuery(req.query.estado),
      buscar: textoQuery(req.query.buscar),
    });

    res.status(200).json({
      success: true,
      data: terceros,
    });
  } catch (error) {
    manejarError(res, error);
  }
};

export const obtenerPorId = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const tercero = await terceroService.obtenerTerceroPorId(req.params.id);

    if (!tercero) {
      res.status(404).json({
        success: false,
        message: 'Tercero no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: tercero,
    });
  } catch (error) {
    manejarError(res, error);
  }
};

export const crear = async (req: Request, res: Response): Promise<void> => {
  try {
    const tercero = await terceroService.crearTercero(req.body);

    res.status(201).json({
      success: true,
      message: 'Tercero creado correctamente',
      data: tercero,
    });
  } catch (error) {
    manejarError(res, error);
  }
};

export const actualizar = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const tercero = await terceroService.actualizarTercero(
      req.params.id,
      req.body
    );

    if (!tercero) {
      res.status(404).json({
        success: false,
        message: 'Tercero no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Tercero actualizado correctamente',
      data: tercero,
    });
  } catch (error) {
    manejarError(res, error);
  }
};

export const cambiarEstado = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const tercero = await terceroService.cambiarEstadoTercero(
      req.params.id,
      req.body.estado
    );

    if (!tercero) {
      res.status(404).json({
        success: false,
        message: 'Tercero no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Estado del tercero actualizado correctamente',
      data: tercero,
    });
  } catch (error) {
    manejarError(res, error);
  }
};

const manejarError = (res: Response, error: unknown): void => {
  if (error instanceof ErrorNegocio) {
    res.status(error.status).json({
      success: false,
      message: error.message,
      ...(error.errores ? { errors: error.errores } : {}),
    });
    return;
  }

  if (error instanceof UniqueConstraintError) {
    res.status(409).json({
      success: false,
      message: 'El RTN ya está registrado',
    });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: error.errors.map((e) => e.message),
    });
    return;
  }

  console.error('Error en módulo de terceros:', error);

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
};
