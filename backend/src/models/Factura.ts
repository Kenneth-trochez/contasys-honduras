import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import { Decimal } from '../types/comunes';
import type { Db } from './index';

export type EstadoFactura = 'Emitida' | 'Anulada' | 'Pagada';

export class Factura extends Model<InferAttributes<Factura>, InferCreationAttributes<Factura>> {
  declare id_factura: CreationOptional<number>;
  declare numero_factura: string;
  declare cai: string;
  declare fecha_emision: CreationOptional<string | Date>;
  declare id_tercero: number;
  declare id_usuario_emisor: number;
  declare subtotal: Decimal;
  declare impuesto_isv: CreationOptional<Decimal>;
  declare total: Decimal;
  declare estado: CreationOptional<EstadoFactura>;

  static inicializar(sequelize: Sequelize): typeof Factura {
    Factura.init({
      id_factura: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      numero_factura: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      cai: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      fecha_emision: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      id_tercero: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_usuario_emisor: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      impuesto_isv: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM('Emitida', 'Anulada', 'Pagada'),
        defaultValue: 'Emitida',
      },
    }, {
      sequelize,
      modelName: 'Factura',
      tableName: 'facturas',
      timestamps: false,
    });
    return Factura;
  }

  static asociar(db: Db): void {
    Factura.hasMany(db.DetalleFactura, {
      foreignKey: 'id_factura',
      as: 'detalles',
    });
  }
}

export default Factura;
