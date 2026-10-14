module.exports = (sequelize, DataTypes) => {
  const MovimientoInventario = sequelize.define('MovimientoInventario', {
    idMovimiento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipoMovimiento: {
      type: DataTypes.ENUM('Entrada', 'Salida', 'Ajuste'),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    motivo: {
      type: DataTypes.STRING(255),
    },
    idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fechaMovimiento: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'movimientos_inventario',
    underscored: true,
    timestamps: false,
  });

  MovimientoInventario.associate = (db) => {
    MovimientoInventario.belongsTo(db.Producto, {
      foreignKey: 'idProducto',
      as: 'producto',
    });
    if (db.Usuario) {
      MovimientoInventario.belongsTo(db.Usuario, {
        foreignKey: 'idUsuario',
        as: 'usuario',
      });
    }
  };

  return MovimientoInventario;
};
