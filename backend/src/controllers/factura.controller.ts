import { Request, Response } from 'express';
import FacturaService from '../services/factura.service';

function responderError(res: Response, error: unknown): void {
  const status = (error as { status?: number }).status || 500;
  const mensaje = error instanceof Error ? error.message : String(error);
  res.status(status).json({ mensaje });
}

export const obtenerFacturas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const facturas = await FacturaService.obtenerFacturas();
    res.status(200).json(facturas);
  } catch (error) {
    responderError(res, error);
  }
};

export const obtenerFacturaPorId = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const factura = await FacturaService.obtenerFacturaPorId(req.params.id);
    res.status(200).json(factura);
  } catch (error) {
    responderError(res, error);
  }
};

export const crearFactura = async (req: Request, res: Response): Promise<void> => {
  try {
    const nuevaFactura = await FacturaService.crearFactura(req.body);
    res.status(201).json(nuevaFactura);
  } catch (error) {
    responderError(res, error);
  }
};

export const editarFactura = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const facturaEditada = await FacturaService.editarFactura(req.params.id, req.body);
    res.status(200).json(facturaEditada);
  } catch (error) {
    responderError(res, error);
  }
};

export const cambiarEstado = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { estado } = req.body;
    const facturaActualizada = await FacturaService.cambiarEstado(req.params.id, estado);
    res.status(200).json(facturaActualizada);
  } catch (error) {
    responderError(res, error);
  }
};
