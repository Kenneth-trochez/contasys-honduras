import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import { Decimal, EstadoActivo } from '../types/comunes';
import type { Db } from './index';

export class Producto extends Model<InferAttributes<Producto>, InferCreationAttributes<Producto>> {
  declare idProducto: CreationOptional<number>;
  declare codigoProducto: string;
  declare nombreProducto: string;
  declare descripcion: string | null;
  declare precioCompra: CreationOptional<Decimal>;
  declare precioVenta: CreationOptional<Decimal>;
  declare stockActual: CreationOptional<Decimal>;
  declare stockMinimo: CreationOptional<Decimal>;
  declare estado: CreationOptional<EstadoActivo>;
  // Ruta relativa de la imagen, p. ej. uploads/productos/7-1730250000-a1b2c3d4.jpg (null si no tiene).
  declare imagen: CreationOptional<string | null>;
  declare fechaCreacion: CreationOptional<Date>;

  static inicializar(sequelize: Sequelize): typeof Producto {
    Producto.init({
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
      imagen: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      fechaCreacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    }, {
      sequelize,
      modelName: 'Producto',
      tableName: 'productos',
      underscored: true,
      timestamps: false,
    });
    return Producto;
  }

  static asociar(db: Db): void {
    Producto.hasMany(db.MovimientoInventario, {
      foreignKey: 'idProducto',
      as: 'movimientos',
    });
    Producto.hasMany(db.DetalleFactura, {
      foreignKey: 'id_producto',
      as: 'detallesFactura',
    });
  }
}

export default Producto;
