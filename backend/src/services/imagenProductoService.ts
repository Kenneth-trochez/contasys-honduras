import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { IMAGEN_PRODUCTO } from '../config/archivos';
import { Producto } from '../models/Producto';
import ErrorNegocio from '../utils/errorNegocio';
import { obtenerProductoPorId } from './inventarioService';

type Id = number | string;

export interface ResultadoImagen {
  producto: Producto;
  imagen: {
    ruta: string;
    ancho: number;
    alto: number;
    bytes: number;
  };
}

// Revisa el contenido real del archivo: un .txt renombrado a .png no pasa.
async function formatoReal(buffer: Buffer): Promise<'jpeg' | 'png'> {
  try {
    const { format } = await sharp(buffer).metadata();
    if (format === 'jpeg' || format === 'png') return format;
  } catch {
    // Sharp no pudo leerlo: no es una imagen válida.
  }
  throw new ErrorNegocio(400, 'El archivo no es una imagen JPEG o PNG válida');
}

// Borra la imagen anterior; solo dentro de la carpeta de productos.
async function borrarImagen(rutaRelativa: string | null): Promise<void> {
  if (!rutaRelativa) return;
  const archivo = path.join(IMAGEN_PRODUCTO.carpeta, path.basename(rutaRelativa));
  await fs.unlink(archivo).catch(() => undefined);
}

/**
 * Guarda (o reemplaza) la imagen de un producto:
 * valida el contenido, la escala con Sharp sin deformarla ni agrandarla,
 * la guarda con nombre único y asocia la ruta al producto.
 */
export async function guardarImagenProducto(
  idProducto: Id,
  archivo: Express.Multer.File | undefined
): Promise<ResultadoImagen> {
  const producto = await obtenerProductoPorId(idProducto);

  if (!archivo) {
    throw new ErrorNegocio(400, `Debe enviar una imagen en el campo "${IMAGEN_PRODUCTO.campoFormulario}"`);
  }

  const formato = await formatoReal(archivo.buffer);
  const lado = IMAGEN_PRODUCTO.ladoMaximoPx;

  let procesada = sharp(archivo.buffer)
    .rotate() // respeta la orientación de las fotos de celular
    .resize({ width: lado, height: lado, fit: 'inside', withoutEnlargement: true });
  procesada = formato === 'jpeg'
    ? procesada.jpeg({ quality: 85 })
    : procesada.png({ compressionLevel: 9 });

  const extension = formato === 'jpeg' ? 'jpg' : 'png';
  const nombre = `${producto.idProducto}-${Date.now()}-${randomBytes(4).toString('hex')}.${extension}`;
  const rutaRelativa = `${IMAGEN_PRODUCTO.rutaRelativa}/${nombre}`;
  const destino = path.join(IMAGEN_PRODUCTO.carpeta, nombre);

  await fs.mkdir(IMAGEN_PRODUCTO.carpeta, { recursive: true });
  const info = await procesada.toFile(destino);

  const anterior = producto.imagen;
  try {
    await producto.update({ imagen: rutaRelativa });
  } catch (error) {
    await borrarImagen(rutaRelativa);
    throw error;
  }
  if (anterior && anterior !== rutaRelativa) {
    await borrarImagen(anterior);
  }

  return {
    producto,
    imagen: { ruta: rutaRelativa, ancho: info.width, alto: info.height, bytes: info.size },
  };
}
