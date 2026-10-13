
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tercero = sequelize.define(
  'Tercero',
  {
    id_tercero: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo_tercero: {
      type: DataTypes.ENUM('Cliente', 'Proveedor', 'Ambos'),
      allowNull: false,
    },
    nombre_razon_social: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre o razón social es obligatorio',
        },
      },
    },
    rtn: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'El correo electrónico no tiene un formato válido',
        },
      },
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM('Activo', 'Inactivo'),
      allowNull: false,
      defaultValue: 'Activo',
    },
  },
  {
    tableName: 'terceros',
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = Tercero;
