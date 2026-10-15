const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const db = {};

fs.readdirSync(__dirname)
  .filter((archivo) => archivo !== 'index.js' && archivo.endsWith('.js'))
  .forEach((archivo) => {
    const exportado = require(path.join(__dirname, archivo));
    const esFabrica = typeof exportado === 'function' && !(exportado.prototype instanceof Sequelize.Model);
    const modelo = esFabrica ? exportado(sequelize, DataTypes) : exportado;
    db[modelo.name] = modelo;
  });

if (db.Usuario && db.Rol) {
  db.Usuario.belongsTo(db.Rol, { foreignKey: 'id_rol', targetKey: 'id_rol', as: 'rol' });
  db.Rol.hasMany(db.Usuario, { foreignKey: 'id_rol', sourceKey: 'id_rol', as: 'usuarios' });
}

Object.keys(db).forEach((nombreModelo) => {
  if (typeof db[nombreModelo].associate === 'function') {
    db[nombreModelo].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
