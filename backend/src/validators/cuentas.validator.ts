import ErrorNegocio from '../utils/errorNegocio';

const TIPOS = ['Activo', 'Pasivo', 'Patrimonio', 'Ingreso', 'Gasto'];
const NATURALEZAS = ['Deudora', 'Acreedora'];
const ESTADOS = ['Activo', 'Inactivo'];

export const validarId = (id: unknown): void => {
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErrorNegocio(400, 'El id no es válido');
  }
};

export const validarDatosCuenta = (
  datos: Record<string, unknown> = {},
  { parcial = false }: { parcial?: boolean } = {}
): void => {
  const errores: string[] = [];
  const enviado = (campo: string) => datos[campo] !== undefined;

  if (!parcial || enviado('codigo')) {
    if (typeof datos.codigo !== 'string' || !/^\d+(\.\d+)*$/.test(datos.codigo.trim())) {
      errores.push('El código es obligatorio y debe ser numérico con puntos (ej: 1.1.01)');
    }
  }

  if (!parcial || enviado('nombre')) {
    if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '' || datos.nombre.length > 100) {
      errores.push('El nombre es obligatorio (máximo 100 caracteres)');
    }
  }

  if (!parcial || enviado('tipoCuenta')) {
    if (!TIPOS.includes(datos.tipoCuenta as string)) {
      errores.push(`El tipo de cuenta debe ser: ${TIPOS.join(', ')}`);
    }
  }

  if (!parcial || enviado('naturaleza')) {
    if (!NATURALEZAS.includes(datos.naturaleza as string)) {
      errores.push(`La naturaleza debe ser: ${NATURALEZAS.join(', ')}`);
    }
  }

  if (!parcial || enviado('nivel')) {
    if (!Number.isInteger(Number(datos.nivel)) || Number(datos.nivel) < 1) {
      errores.push('El nivel es obligatorio y debe ser un entero mayor o igual a 1');
    }
  }

  if (enviado('idCuentaPadre') && datos.idCuentaPadre !== null) {
    if (!Number.isInteger(Number(datos.idCuentaPadre)) || Number(datos.idCuentaPadre) <= 0) {
      errores.push('La cuenta padre no es válida');
    }
  }

  if (enviado('aceptaMovimientos') && typeof datos.aceptaMovimientos !== 'boolean') {
    errores.push('aceptaMovimientos debe ser true o false');
  }

  if (errores.length > 0) {
    throw new ErrorNegocio(400, 'Datos inválidos', errores);
  }
};

export const validarEstado = (estado: unknown): void => {
  if (!ESTADOS.includes(estado as string)) {
    throw new ErrorNegocio(400, `El estado debe ser: ${ESTADOS.join(', ')}`);
  }
};
