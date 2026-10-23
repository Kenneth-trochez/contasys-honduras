import { Request, Response } from 'express';
import ErrorNegocio from '../utils/errorNegocio';
import * as cuentasService from '../services/cuentas.service';
import * as validator from '../validators/cuentas.validator';
import { textoQuery } from '../utils/peticion';

const manejarError = (error: unknown, res: Response): void => {
  if (error instanceof ErrorNegocio) {
    res.status(error.status).json({
      ok: false,
      mensaje: error.message,
      errores: error.errores,
    });
    return;
  }
  console.error(error);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
};

export const listar = async (req: Request, res: Response): Promise<void> => {
  try {
    const cuentas = await cuentasService.listarCuentas({
      tipoCuenta: textoQuery(req.query.tipoCuenta),
      estado: textoQuery(req.query.estado),
      nivel: textoQuery(req.query.nivel),
      idCuentaPadre: textoQuery(req.query.idCuentaPadre),
      buscar: textoQuery(req.query.buscar),
    });
    res.status(200).json({ ok: true, data: cuentas });
  } catch (error) {
    manejarError(error, res);
  }
};

export const obtener = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    validator.validarId(req.params.id);
    const cuenta = await cuentasService.obtenerCuentaPorId(req.params.id);
    res.status(200).json({ ok: true, data: cuenta });
  } catch (error) {
    manejarError(error, res);
  }
};

export const crear = async (req: Request, res: Response): Promise<void> => {
  try {
    validator.validarDatosCuenta(req.body);
    const cuenta = await cuentasService.crearCuenta(req.body);
    res.status(201).json({ ok: true, mensaje: 'Cuenta creada correctamente', data: cuenta });
  } catch (error) {
    manejarError(error, res);
  }
};

export const actualizar = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    validator.validarId(req.params.id);
    validator.validarDatosCuenta(req.body, { parcial: true });
    const cuenta = await cuentasService.actualizarCuenta(req.params.id, req.body);
    res.status(200).json({ ok: true, mensaje: 'Cuenta actualizada correctamente', data: cuenta });
  } catch (error) {
    manejarError(error, res);
  }
};

export const cambiarEstado = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    validator.validarId(req.params.id);
    validator.validarEstado(req.body.estado);
    const cuenta = await cuentasService.cambiarEstadoCuenta(req.params.id, req.body.estado);
    res.status(200).json({ ok: true, mensaje: 'Estado actualizado correctamente', data: cuenta });
  } catch (error) {
    manejarError(error, res);
  }
};
