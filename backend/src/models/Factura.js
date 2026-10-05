const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Factura = sequelize.define('Factura', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numeroFactura: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  cai: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  terceroId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Terceros', key: 'id' }
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  isv: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  estado: {
    type: DataTypes.ENUM('EMITIDA', 'ANULADA'),
    allowNull: false,
    defaultValue: 'EMITIDA'
  }
}, { timestamps: true });

module.exports = Factura;