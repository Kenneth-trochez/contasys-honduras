import ErrorNegocio from '../utils/errorNegocio';
import { EstadoActivo } from '../types/comunes';

// Largos máximos según las columnas de la tabla productos.
const LARGO_MAXIMO = {
  codigoProducto: 50,
  nombreProducto: 150,
  descripcion: 255,
} as const;

// DECIMAL(12,2): 10 dígitos enteros y 2 decimales.
const MONTO_MAXIMO = 9999999999.99;

export const ESTADOS_PRODUCTO: EstadoActivo[] = ['Activo', 'Inactivo'];

type CampoTexto = keyof typeof LARGO_MAXIMO;
type CampoNumero = 'precioCompra' | 'precioVenta' | 'stockMinimo';

const enviado = (valor: unknown): boolean => valor !== undefined && valor !== null;

// Convierte a número solo si el valor es un número o un texto numérico ("120.50").
function aNumero(valor: unknown): number | null {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
  if (typeof valor === 'string' && valor.trim() !== '') {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
  }
  return null;
}

function revisarTexto(
  datos: Record<string, unknown>,
  campo: CampoTexto,
  { obligatorio, permiteVacio }: { obligatorio: boolean; permiteVacio: boolean },
  errores: string[]
): void {
  const valor = datos[campo];
  if (!enviado(valor) || valor === '') {
    if (obligatorio) errores.push(`${campo} es obligatorio`);
    else if (valor === '' && !permiteVacio) errores.push(`${campo} no puede estar vacío`);
    return;
  }
  if (typeof valor !== 'string') {
    errores.push(`${campo} debe ser texto`);
    return;
  }
  if (!permiteVacio && valor.trim() === '') {
    errores.push(`${campo} no puede estar vacío`);
    return;
  }
  if (valor.length > LARGO_MAXIMO[campo]) {
    errores.push(`${campo} admite como máximo ${LARGO_MAXIMO[campo]} caracteres`);
  }
}

function revisarNumero(
  datos: Record<string, unknown>,
  campo: CampoNumero,
  { obligatorio, mayorQueCero }: { obligatorio: boolean; mayorQueCero: boolean },
  errores: string[]
): void {
  const valor = datos[campo];
  if (!enviado(valor)) {
    if (obligatorio) errores.push(`${campo} es obligatorio`);
    return;
  }
  const numero = aNumero(valor);
  if (numero === null) {
    errores.push(`${campo} debe ser un número`);
    return;
  }
  if (mayorQueCero && numero <= 0) {
    errores.push(`${campo} debe ser mayor que 0`);
  } else if (!mayorQueCero && numero < 0) {
    errores.push(`${campo} no puede ser negativo`);
  } else if (numero > MONTO_MAXIMO) {
    errores.push(`${campo} no puede ser mayor que ${MONTO_MAXIMO}`);
  }
}

/**
 * Valida el body de crear (esCreacion: true) o editar producto.
 * Junta todos los problemas y responde un solo 400 con la lista en `errors`.
 * Al editar, codigoProducto y stockActual se ignoran (no se pueden cambiar).
 */
export function validarDatosProducto(datos: unknown, { esCreacion }: { esCreacion: boolean }): void {
  if (typeof datos !== 'object' || datos === null || Array.isArray(datos)) {
    throw new ErrorNegocio(400, 'Datos inválidos', ['El cuerpo de la petición debe ser un objeto JSON']);
  }
  const campos = datos as Record<string, unknown>;
  const errores: string[] = [];

  if (esCreacion) {
    revisarTexto(campos, 'codigoProducto', { obligatorio: true, permiteVacio: false }, errores);
  }
  revisarTexto(campos, 'nombreProducto', { obligatorio: esCreacion, permiteVacio: false }, errores);
  revisarTexto(campos, 'descripcion', { obligatorio: false, permiteVacio: true }, errores);

  revisarNumero(campos, 'precioVenta', { obligatorio: esCreacion, mayorQueCero: true }, errores);
  revisarNumero(campos, 'precioCompra', { obligatorio: false, mayorQueCero: false }, errores);
  revisarNumero(campos, 'stockMinimo', { obligatorio: false, mayorQueCero: false }, errores);

  if (errores.length > 0) {
    throw new ErrorNegocio(400, errores.length === 1 ? errores[0] : 'Datos inválidos', errores);
  }
}

// Filtro ?estado= del listado de productos: vacío o un estado válido.
export function validarFiltroEstado(estado: string | undefined): void {
  if (estado && !ESTADOS_PRODUCTO.includes(estado as EstadoActivo)) {
    throw new ErrorNegocio(400, `Estado inválido, use uno de: ${ESTADOS_PRODUCTO.join(', ')}`);
  }
}
