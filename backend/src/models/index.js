const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = require('./Rol')(sequelize, DataTypes);
const Usuario = require('./Usuario')(sequelize, DataTypes);

// Un usuario pertenece a un Rol
Usuario.belongsTo(Rol, { 
  foreignKey: 'id_rol', 
  targetKey: 'id_rol', 
  as: 'rol' 
});

// Un Rol tiene muchos Usuarios
Rol.hasMany(Usuario, { 
  foreignKey: 'id_rol', 
  sourceKey: 'id_rol', 
  as: 'usuarios' 
});

module.exports = { sequelize, Rol, Usuario };