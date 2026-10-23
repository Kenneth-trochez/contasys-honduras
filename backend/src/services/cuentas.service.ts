import { Op, WhereOptions } from 'sequelize';
import { CuentaContable } from '../models';
import { Naturaleza, TipoCuenta } from '../models/CuentaContable';
import ErrorNegocio from '../utils/errorNegocio';
import { EstadoActivo } from '../types/comunes';

type Id = number | string;

// Datos que llegan en el body; el validador ya revisó su formato.
export interface DatosCuenta {
  codigo?: string;
  nombre?: string;
  tipoCuenta?: TipoCuenta;
  naturaleza?: Naturaleza;
  idCuentaPadre?: number | string | null;
  nivel?: number | string;
  aceptaMovimientos?: boolean;
}

export interface FiltrosCuenta {
  tipoCuenta?: string;
  estado?: string;
  nivel?: string;
  idCuentaPadre?: string;
  buscar?: string;
}

interface DatosPadre {
  tipoCuenta?: TipoCuenta;
  nivel?: number | string;
  idCuentaPadre?: number | string | null;
}

const buscarCuenta = async (id: Id): Promise<CuentaContable> => {
  const cuenta = await CuentaContable.findByPk(id);
  if (!cuenta) {
    throw new ErrorNegocio(404, 'Cuenta contable no encontrada');
  }
  return cuenta;
};

const validarPadre = async (
  { tipoCuenta, nivel, idCuentaPadre }: DatosPadre,
  idActual: number | null = null
): Promise<CuentaContable | null> => {
  if (idCuentaPadre === null || idCuentaPadre === undefined) {
    if (Number(nivel) !== 1) {
      throw new ErrorNegocio(400, 'Una cuenta sin cuenta padre debe ser de nivel 1');
    }
    return null;
  }

  if (idActual && Number(idCuentaPadre) === Number(idActual)) {
    throw new ErrorNegocio(400, 'Una cuenta no puede ser su propia cuenta padre');
  }

  const padre = await CuentaContable.findByPk(idCuentaPadre);
  if (!padre) {
    throw new ErrorNegocio(404, 'La cuenta padre no existe');
  }
  if (padre.estado !== 'Activo') {
    throw new ErrorNegocio(400, 'La cuenta padre está inactiva');
  }
  if (padre.aceptaMovimientos) {
    throw new ErrorNegocio(400, 'Una cuenta que acepta movimientos no puede tener cuentas hijas');
  }
  if (padre.tipoCuenta !== tipoCuenta) {
    throw new ErrorNegocio(
      400,
      `El tipo de cuenta debe coincidir con el de la cuenta padre (${padre.tipoCuenta})`
    );
  }
  if (Number(nivel) !== padre.nivel + 1) {
    throw new ErrorNegocio(400, `El nivel correcto para esta cuenta es ${padre.nivel + 1}`);
  }

  // Evita ciclos: el nuevo padre no puede ser descendiente de la cuenta
  if (idActual) {
    let actual: CuentaContable | null = padre;
    while (actual && actual.idCuentaPadre) {
      if (actual.idCuentaPadre === Number(idActual)) {
        throw new ErrorNegocio(400, 'La cuenta padre no puede ser una cuenta hija de esta cuenta');
      }
      actual = await CuentaContable.findByPk(actual.idCuentaPadre);
    }
  }

  return padre;
};

export const listarCuentas = async (filtros: FiltrosCuenta = {}): Promise<CuentaContable[]> => {
  const condiciones: Record<string | symbol, unknown> = {};

  if (filtros.tipoCuenta) condiciones.tipoCuenta = filtros.tipoCuenta;
  if (filtros.estado) condiciones.estado = filtros.estado;
  if (filtros.nivel) condiciones.nivel = Number(filtros.nivel);
  if (filtros.idCuentaPadre) condiciones.idCuentaPadre = Number(filtros.idCuentaPadre);
  if (filtros.buscar) {
    condiciones[Op.or] = [
      { codigo: { [Op.like]: `%${filtros.buscar}%` } },
      { nombre: { [Op.like]: `%${filtros.buscar}%` } },
    ];
  }

  return CuentaContable.findAll({
    where: condiciones as WhereOptions<CuentaContable>,
    order: [['codigo', 'ASC']],
  });
};

export const obtenerCuentaPorId = async (id: Id): Promise<CuentaContable> => {
  const cuenta = await CuentaContable.findByPk(id, {
    include: [{ model: CuentaContable, as: 'padre', attributes: ['idCuenta', 'codigo', 'nombre'] }],
  });
  if (!cuenta) {
    throw new ErrorNegocio(404, 'Cuenta contable no encontrada');
  }
  return cuenta;
};

export const crearCuenta = async (datos: DatosCuenta): Promise<CuentaContable> => {
  // El validador garantiza que codigo, nombre, tipoCuenta y naturaleza vienen en la creación.
  const codigo = (datos.codigo as string).trim();

  const existente = await CuentaContable.findOne({ where: { codigo } });
  if (existente) {
    throw new ErrorNegocio(409, `Ya existe una cuenta con el código ${codigo}`);
  }

  const idCuentaPadre = datos.idCuentaPadre ?? null;
  await validarPadre({ ...datos, idCuentaPadre });

  return CuentaContable.create({
    codigo,
    nombre: (datos.nombre as string).trim(),
    tipoCuenta: datos.tipoCuenta as TipoCuenta,
    naturaleza: datos.naturaleza as Naturaleza,
    idCuentaPadre: idCuentaPadre === null ? null : Number(idCuentaPadre),
    nivel: Number(datos.nivel),
    aceptaMovimientos: datos.aceptaMovimientos ?? false,
    estado: 'Activo',
  });
};

export const actualizarCuenta = async (id: Id, datos: DatosCuenta): Promise<CuentaContable> => {
  const cuenta = await buscarCuenta(id);

  const nuevo = {
    codigo: datos.codigo !== undefined ? datos.codigo.trim() : cuenta.codigo,
    nombre: datos.nombre !== undefined ? datos.nombre.trim() : cuenta.nombre,
    tipoCuenta: datos.tipoCuenta ?? cuenta.tipoCuenta,
    naturaleza: datos.naturaleza ?? cuenta.naturaleza,
    idCuentaPadre: datos.idCuentaPadre !== undefined ? datos.idCuentaPadre : cuenta.idCuentaPadre,
    nivel: datos.nivel !== undefined ? Number(datos.nivel) : cuenta.nivel,
    aceptaMovimientos: datos.aceptaMovimientos ?? cuenta.aceptaMovimientos,
  };

  if (nuevo.codigo !== cuenta.codigo) {
    const duplicado = await CuentaContable.findOne({
      where: { codigo: nuevo.codigo, idCuenta: { [Op.ne]: cuenta.idCuenta } },
    });
    if (duplicado) {
      throw new ErrorNegocio(409, `Ya existe una cuenta con el código ${nuevo.codigo}`);
    }
  }

  await validarPadre(nuevo, cuenta.idCuenta);

  const totalHijas = await CuentaContable.count({ where: { idCuentaPadre: cuenta.idCuenta } });
  if (totalHijas > 0) {
    if (nuevo.tipoCuenta !== cuenta.tipoCuenta || nuevo.nivel !== cuenta.nivel) {
      throw new ErrorNegocio(400, 'No se puede cambiar el tipo o nivel de una cuenta que tiene cuentas hijas');
    }
    if (nuevo.aceptaMovimientos) {
      throw new ErrorNegocio(400, 'Una cuenta con cuentas hijas no puede aceptar movimientos');
    }
  }

  await cuenta.update({
    ...nuevo,
    idCuentaPadre: nuevo.idCuentaPadre === null ? null : Number(nuevo.idCuentaPadre),
  });
  return cuenta;
};

export const cambiarEstadoCuenta = async (id: Id, estado: EstadoActivo): Promise<CuentaContable> => {
  const cuenta = await buscarCuenta(id);

  if (cuenta.estado === estado) {
    return cuenta;
  }

  if (estado === 'Inactivo') {
    const hijasActivas = await CuentaContable.count({
      where: { idCuentaPadre: cuenta.idCuenta, estado: 'Activo' },
    });
    if (hijasActivas > 0) {
      throw new ErrorNegocio(409, 'No se puede desactivar una cuenta que tiene cuentas hijas activas');
    }
  } else if (cuenta.idCuentaPadre) {
    const padre = await CuentaContable.findByPk(cuenta.idCuentaPadre);
    if (padre && padre.estado !== 'Activo') {
      throw new ErrorNegocio(409, 'No se puede activar una cuenta cuya cuenta padre está inactiva');
    }
  }

  await cuenta.update({ estado });
  return cuenta;
};

// Para que Henry (asientos) y otros módulos verifiquen una cuenta antes de usarla
export const validarCuentaParaMovimiento = async (idCuenta: Id): Promise<CuentaContable> => {
  const cuenta = await buscarCuenta(idCuenta);
  if (cuenta.estado !== 'Activo') {
    throw new ErrorNegocio(400, `La cuenta ${cuenta.codigo} está inactiva`);
  }
  if (!cuenta.aceptaMovimientos) {
    throw new ErrorNegocio(400, `La cuenta ${cuenta.codigo} no acepta movimientos`);
  }
  return cuenta;
};
