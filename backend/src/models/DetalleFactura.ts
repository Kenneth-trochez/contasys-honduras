import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import { Decimal } from '../types/comunes';
import type { Db } from './index';

export class DetalleFactura extends Model<InferAttributes<DetalleFactura>, InferCreationAttributes<DetalleFactura>> {
  declare id_detalle_factura: CreationOptional<number>;
  declare id_factura: number;
  declare id_producto: number | null;
  declare descripcion_item: string;
  declare cantidad: Decimal;
  declare precio_unitario: Decimal;
  declare subtotal_linea: Decimal;

  static inicializar(sequelize: Sequelize): typeof DetalleFactura {
    DetalleFactura.init({
      id_detalle_factura: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_factura: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_producto: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      descripcion_item: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      precio_unitario: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      subtotal_linea: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    }, {
      sequelize,
      modelName: 'DetalleFactura',
      tableName: 'detalle_factura',
      timestamps: false,
    });
    return DetalleFactura;
  }

  static asociar(db: Db): void {
    DetalleFactura.belongsTo(db.Factura, {
      foreignKey: 'id_factura',
      as: 'factura',
    });
    DetalleFactura.belongsTo(db.Producto, {
      foreignKey: 'id_producto',
      as: 'producto',
    });
  }
}

export default DetalleFactura;
