module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define('Producto', {
    idProducto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigoProducto: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    nombreProducto: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
    },
    precioCompra: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    precioVenta: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    stockActual: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    stockMinimo: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    estado: {
      type: DataTypes.ENUM('Activo', 'Inactivo'),
      allowNull: false,
      defaultValue: 'Activo',
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'productos',
    underscored: true,
    timestamps: false,
  });

  Producto.associate = (db) => {
    if (db.MovimientoInventario) {
      Producto.hasMany(db.MovimientoInventario, {
        foreignKey: 'idProducto',
        as: 'movimientos',
      });
    }
    if (db.DetalleFactura) {
      Producto.hasMany(db.DetalleFactura, {
        foreignKey: 'id_producto',
        as: 'detallesFactura',
      });
    }
  };

  return Producto;
};
