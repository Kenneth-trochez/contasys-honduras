import path from 'path';

// Carpeta backend/uploads: funciona igual desde src/ (npm run dev) y desde dist/ (npm start).
export const CARPETA_UPLOADS = path.resolve(__dirname, '..', '..', 'uploads');

// URL pública desde la que el servidor sirve los archivos subidos.
export const RUTA_PUBLICA_UPLOADS = '/uploads';

// Reglas de las imágenes de productos (acordadas en la Fase 0 del Sprint 3).
export const IMAGEN_PRODUCTO = {
  carpeta: path.join(CARPETA_UPLOADS, 'productos'),
  rutaRelativa: 'uploads/productos',
  campoFormulario: 'imagen',
  tamanoMaximoBytes: 5 * 1024 * 1024,
  tiposPermitidos: ['image/jpeg', 'image/png'],
  ladoMaximoPx: 800,
} as const;
