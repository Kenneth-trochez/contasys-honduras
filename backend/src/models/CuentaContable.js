module.exports = (sequelize, DataTypes) => {
  const CuentaContable = sequelize.define('CuentaContable', {
    idCuenta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'codigo_cuenta',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'nombre_cuenta',
    },
    tipoCuenta: {
      type: DataTypes.ENUM('Activo', 'Pasivo', 'Patrimonio', 'Ingreso', 'Gasto'),
      allowNull: false,
    },
    naturaleza: {
      type: DataTypes.ENUM('Deudora', 'Acreedora'),
      allowNull: false,
    },
    idCuentaPadre: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nivel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    aceptaMovimientos: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'permite_movimiento',
    },
    estado: {
      type: DataTypes.ENUM('Activo', 'Inactivo'),
      allowNull: false,
      defaultValue: 'Activo',
    },
  }, {
    tableName: 'cuentas_contables',
    underscored: true,
    timestamps: false,
  });

  CuentaContable.associate = (db) => {
    CuentaContable.belongsTo(CuentaContable, {
      foreignKey: 'idCuentaPadre',
      as: 'padre',
    });
    CuentaContable.hasMany(CuentaContable, {
      foreignKey: 'idCuentaPadre',
      as: 'hijas',
    });
    if (db.DetalleAsiento) {
      CuentaContable.hasMany(db.DetalleAsiento, {
        foreignKey: 'idCuenta',
        as: 'movimientos',
      });
    }
  };

  return CuentaContable;
};