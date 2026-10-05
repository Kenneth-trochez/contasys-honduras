module.exports = (sequelize, DataTypes) => {
  const DetalleAsiento = sequelize.define('DetalleAsiento', {
    idDetalleAsiento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idAsiento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idCuenta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    debe: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    haber: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'detalle_asiento',
    underscored: true,
    timestamps: false,
  });

  DetalleAsiento.associate = (db) => {
    DetalleAsiento.belongsTo(db.AsientoContable, {
      foreignKey: 'idAsiento',
      as: 'asiento',
    });
    if (db.CuentaContable) {
      DetalleAsiento.belongsTo(db.CuentaContable, {
        foreignKey: 'idCuenta',
        as: 'cuenta',
      });
    }
  };

  return DetalleAsiento;
};
