const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleFactura = sequelize.define('DetalleFactura', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  facturaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Facturas', key: 'id' }
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Inventarios', key: 'id' }
  },
  cantidad: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  }
}, { timestamps: false });

module.exports = DetalleFactura;