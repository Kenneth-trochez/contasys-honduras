import { NextFunction, Request, RequestHandler, Response } from 'express';
import multer, { FileFilterCallback, MulterError } from 'multer';
import { IMAGEN_PRODUCTO } from '../config/archivos';

const MB = IMAGEN_PRODUCTO.tamanoMaximoBytes / (1024 * 1024);

// La imagen se queda en memoria: Sharp la procesa y el servicio la guarda en disco.
const cargador = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: IMAGEN_PRODUCTO.tamanoMaximoBytes, files: 1 },
  fileFilter: (_req: Request, archivo: Express.Multer.File, cb: FileFilterCallback) => {
    if ((IMAGEN_PRODUCTO.tiposPermitidos as readonly string[]).includes(archivo.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'formato'));
  },
}).single(IMAGEN_PRODUCTO.campoFormulario);

function mensajeDeError(error: unknown): string {
  if (error instanceof MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') return `La imagen supera el máximo de ${MB} MB`;
    if (error.code === 'LIMIT_FILE_COUNT') return 'Solo se permite una imagen por petición';
    if (error.code === 'LIMIT_UNEXPECTED_FILE' && error.field === 'formato') {
      return 'Formato no permitido: solo se aceptan imágenes JPEG o PNG';
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return `Envíe la imagen en el campo "${IMAGEN_PRODUCTO.campoFormulario}"`;
    }
  }
  return 'No se pudo leer la imagen enviada';
}

// Recibe la imagen (multipart/form-data) y responde 400 si no cumple las reglas.
export const subirImagenProducto: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  cargador(req, res, (error: unknown) => {
    if (error) {
      res.status(400).json({ ok: false, message: mensajeDeError(error) });
      return;
    }
    next();
  });
};
