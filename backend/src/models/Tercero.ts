import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import { EstadoActivo } from '../types/comunes';

export type TipoTercero = 'Cliente' | 'Proveedor' | 'Ambos';

export class Tercero extends Model<InferAttributes<Tercero>, InferCreationAttributes<Tercero>> {
  declare id_tercero: CreationOptional<number>;
  declare tipo_tercero: TipoTercero;
  declare nombre_razon_social: string;
  declare rtn: string | null;
  declare telefono: string | null;
  declare email: string | null;
  declare direccion: string | null;
  declare estado: CreationOptional<EstadoActivo>;

  static inicializar(sequelize: Sequelize): typeof Tercero {
    Tercero.init({
      id_tercero: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tipo_tercero: {
        type: DataTypes.ENUM('Cliente', 'Proveedor', 'Ambos'),
        allowNull: false,
      },
      nombre_razon_social: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'El nombre o razón social es obligatorio',
          },
        },
      },
      rtn: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          isEmail: {
            msg: 'El correo electrónico no tiene un formato válido',
          },
        },
      },
      direccion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      estado: {
        type: DataTypes.ENUM('Activo', 'Inactivo'),
        allowNull: false,
        defaultValue: 'Activo',
      },
    }, {
      sequelize,
      modelName: 'Tercero',
      tableName: 'terceros',
      timestamps: false,
      freezeTableName: true,
    });
    return Tercero;
  }
}

export default Tercero;
