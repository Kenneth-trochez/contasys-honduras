import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import type { Db } from './index';

export type EstadoAsiento = 'Borrador' | 'Publicado' | 'Anulado';

export class AsientoContable extends Model<InferAttributes<AsientoContable>, InferCreationAttributes<AsientoContable>> {
  declare idAsiento: CreationOptional<number>;
  declare numeroAsiento: number;
  declare fechaAsiento: string;
  declare concepto: string;
  declare idUsuarioRegistro: number;
  declare estado: CreationOptional<EstadoAsiento>;
  declare fechaRegistro: CreationOptional<Date>;

  static inicializar(sequelize: Sequelize): typeof AsientoContable {
    AsientoContable.init({
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
      sequelize,
      modelName: 'AsientoContable',
      tableName: 'asientos_contables',
      underscored: true,
      timestamps: false,
    });
    return AsientoContable;
  }

  static asociar(db: Db): void {
    AsientoContable.belongsTo(db.Usuario, {
      foreignKey: 'idUsuarioRegistro',
      as: 'usuarioRegistro',
    });
    AsientoContable.hasMany(db.DetalleAsiento, {
      foreignKey: 'idAsiento',
      as: 'detalles',
      onDelete: 'CASCADE',
    });
  }
}

export default AsientoContable;
