module.exports = (sequelize, DataTypes) => {
  const DetalleFactura = sequelize.define('DetalleFactura', {
    id_detalle_factura: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_factura: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    descripcion_item: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    cantidad: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    subtotal_linea: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  }, {
    tableName: 'detalle_factura',
    timestamps: false
  });

  return DetalleFactura;
};