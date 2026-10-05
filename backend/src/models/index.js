const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const db = {};

fs.readdirSync(__dirname)
  .filter((archivo) => archivo !== 'index.js' && archivo.endsWith('.js'))
  .forEach((archivo) => {
    const modelo = require(path.join(__dirname, archivo))(sequelize, DataTypes);
    db[modelo.name] = modelo;
  });

Object.keys(db).forEach((nombreModelo) => {
  if (typeof db[nombreModelo].associate === 'function') {
    db[nombreModelo].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
