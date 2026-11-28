import { Sequelize } from 'sequelize';
import sequelize from '../config/database';
import { AsientoContable } from './AsientoContable';
import { CuentaContable } from './CuentaContable';
import { DetalleAsiento } from './DetalleAsiento';
import { DetalleFactura } from './DetalleFactura';
import { Factura } from './Factura';
import { MovimientoInventario } from './MovimientoInventario';
import { Producto } from './Producto';
import { Rol } from './Rol';
import { Tercero } from './Tercero';
import { Usuario } from './Usuario';
import { TokenRecuperacion } from './TokenRecuperacion';


const modelos = {
  AsientoContable: AsientoContable.inicializar(sequelize),
  CuentaContable: CuentaContable.inicializar(sequelize),
  DetalleAsiento: DetalleAsiento.inicializar(sequelize),
  DetalleFactura: DetalleFactura.inicializar(sequelize),
  Factura: Factura.inicializar(sequelize),
  MovimientoInventario: MovimientoInventario.inicializar(sequelize),
  Producto: Producto.inicializar(sequelize),
  Rol: Rol.inicializar(sequelize),
  Tercero: Tercero.inicializar(sequelize),
  Usuario: Usuario.inicializar(sequelize),
  TokenRecuperacion: TokenRecuperacion.inicializar(sequelize),
};

export type Modelos = typeof modelos;

export interface Db extends Modelos {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
}

const db: Db = {
  ...modelos,
  sequelize,
  Sequelize,
};

// Relaciones de usuarios y roles.
Usuario.belongsTo(Rol, {
  foreignKey: 'id_rol',
  targetKey: 'id_rol',
  as: 'rol',
});

Rol.hasMany(Usuario, {
  foreignKey: 'id_rol',
  sourceKey: 'id_rol',
  as: 'usuarios',
});

// Relaciones de recuperación de contraseña.
Usuario.hasMany(TokenRecuperacion, {
  foreignKey: 'id_usuario',
  sourceKey: 'id_usuario',
  as: 'tokensRecuperacion',
});

TokenRecuperacion.belongsTo(Usuario, {
  foreignKey: 'id_usuario',
  targetKey: 'id_usuario',
  as: 'usuario',
});

// Asociaciones de los demás modelos.
AsientoContable.asociar(db);
CuentaContable.asociar(db);
DetalleAsiento.asociar(db);
DetalleFactura.asociar(db);
Factura.asociar(db);
MovimientoInventario.asociar(db);
Producto.asociar(db);

export {
  sequelize,
  Sequelize,
  AsientoContable,
  CuentaContable,
  DetalleAsiento,
  DetalleFactura,
  Factura,
  MovimientoInventario,
  Producto,
  Rol,
  Tercero,
  Usuario,
  TokenRecuperacion,
};

export default db;
