import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import { Decimal } from '../types/comunes';
import type { Db } from './index';

export class DetalleAsiento extends Model<InferAttributes<DetalleAsiento>, InferCreationAttributes<DetalleAsiento>> {
  declare idDetalleAsiento: CreationOptional<number>;
  declare idAsiento: number;
  declare idCuenta: number;
  declare debe: CreationOptional<Decimal>;
  declare haber: CreationOptional<Decimal>;

  static inicializar(sequelize: Sequelize): typeof DetalleAsiento {
    DetalleAsiento.init({
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
      sequelize,
      modelName: 'DetalleAsiento',
      tableName: 'detalle_asiento',
      underscored: true,
      timestamps: false,
    });
    return DetalleAsiento;
  }

  static asociar(db: Db): void {
    DetalleAsiento.belongsTo(db.AsientoContable, {
      foreignKey: 'idAsiento',
      as: 'asiento',
    });
    DetalleAsiento.belongsTo(db.CuentaContable, {
      foreignKey: 'idCuenta',
      as: 'cuenta',
    });
  }
}

export default DetalleAsiento;
