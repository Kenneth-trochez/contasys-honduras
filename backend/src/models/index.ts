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

// Todos los modelos del proyecto. Al agregar un modelo nuevo hay que registrarlo
// aquí; TypeScript avisa si falta en `Db` o si el nombre no coincide.
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

Usuario.belongsTo(Rol, { foreignKey: 'id_rol', targetKey: 'id_rol', as: 'rol' });
Rol.hasMany(Usuario, { foreignKey: 'id_rol', sourceKey: 'id_rol', as: 'usuarios' });

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
};

export default db;
