module.exports = (sequelize, DataTypes) => {
  const AsientoContable = sequelize.define('AsientoContable', {
    idAsiento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numeroAsiento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    fechaAsiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    concepto: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    idUsuarioRegistro: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('Borrador', 'Publicado', 'Anulado'),
      allowNull: false,
      defaultValue: 'Publicado',
    },
    fechaRegistro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'asientos_contables',
    underscored: true,
    timestamps: false,
  });

  AsientoContable.associate = (db) => {
    if (db.Usuario) {
      AsientoContable.belongsTo(db.Usuario, {
        foreignKey: 'idUsuarioRegistro',
        as: 'usuarioRegistro',
      });
    }
    if (db.DetalleAsiento) {
      AsientoContable.hasMany(db.DetalleAsiento, {
        foreignKey: 'idAsiento',
        as: 'detalles',
        onDelete: 'CASCADE',
      });
    }
  };

  return AsientoContable;
};
