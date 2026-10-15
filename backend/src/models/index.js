
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = require('./Rol')(sequelize, DataTypes);
const Usuario = require('./Usuario')(sequelize, DataTypes);
const Producto = require('./Producto')(sequelize, DataTypes);
const MovimientoInventario = require('./MovimientoInventario')(
  sequelize,
  DataTypes
);

// Relaciones de usuarios y roles
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

// Relaciones de inventario
Producto.hasMany(MovimientoInventario, {
  foreignKey: 'idProducto',
  as: 'movimientos',
});

MovimientoInventario.belongsTo(Producto, {
  foreignKey: 'idProducto',
  as: 'producto',
});

MovimientoInventario.belongsTo(Usuario, {
  foreignKey: 'idUsuario',
  as: 'usuario',
});

module.exports = {
  Sequelize,
  sequelize,
  Rol,
  Usuario,
  Producto,
  MovimientoInventario,
};