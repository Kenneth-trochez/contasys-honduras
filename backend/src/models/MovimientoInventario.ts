import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import { Decimal } from '../types/comunes';
import type { Db } from './index';

export type TipoMovimiento = 'Entrada' | 'Salida' | 'Ajuste';

export class MovimientoInventario extends Model<InferAttributes<MovimientoInventario>, InferCreationAttributes<MovimientoInventario>> {
  declare idMovimiento: CreationOptional<number>;
  declare idProducto: number;
  declare tipoMovimiento: TipoMovimiento;
  declare cantidad: Decimal;
  declare motivo: string | null;
  declare idUsuario: number;
  declare fechaMovimiento: CreationOptional<Date>;

  static inicializar(sequelize: Sequelize): typeof MovimientoInventario {
    MovimientoInventario.init({
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
      sequelize,
      modelName: 'MovimientoInventario',
      tableName: 'movimientos_inventario',
      underscored: true,
      timestamps: false,
    });
    return MovimientoInventario;
  }

  static asociar(db: Db): void {
    MovimientoInventario.belongsTo(db.Producto, {
      foreignKey: 'idProducto',
      as: 'producto',
    });
    MovimientoInventario.belongsTo(db.Usuario, {
      foreignKey: 'idUsuario',
      as: 'usuario',
    });
  }
}

export default MovimientoInventario;
