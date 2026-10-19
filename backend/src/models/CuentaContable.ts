import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import { EstadoActivo } from '../types/comunes';
import type { Db } from './index';

export type TipoCuenta = 'Activo' | 'Pasivo' | 'Patrimonio' | 'Ingreso' | 'Gasto';
export type Naturaleza = 'Deudora' | 'Acreedora';

export class CuentaContable extends Model<InferAttributes<CuentaContable>, InferCreationAttributes<CuentaContable>> {
  declare idCuenta: CreationOptional<number>;
  declare codigo: string;
  declare nombre: string;
  declare tipoCuenta: TipoCuenta;
  declare naturaleza: Naturaleza;
  declare idCuentaPadre: number | null;
  declare nivel: CreationOptional<number>;
  declare aceptaMovimientos: CreationOptional<boolean>;
  declare estado: CreationOptional<EstadoActivo>;

  static inicializar(sequelize: Sequelize): typeof CuentaContable {
    CuentaContable.init({
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
      sequelize,
      modelName: 'CuentaContable',
      tableName: 'cuentas_contables',
      underscored: true,
      timestamps: false,
    });
    return CuentaContable;
  }

  static asociar(db: Db): void {
    CuentaContable.belongsTo(CuentaContable, {
      foreignKey: 'idCuentaPadre',
      as: 'padre',
    });
    CuentaContable.hasMany(CuentaContable, {
      foreignKey: 'idCuentaPadre',
      as: 'hijas',
    });
    CuentaContable.hasMany(db.DetalleAsiento, {
      foreignKey: 'idCuenta',
      as: 'movimientos',
    });
  }
}

export default CuentaContable;
