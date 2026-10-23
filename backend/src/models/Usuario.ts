import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import { EstadoActivo } from '../types/comunes';

export class Usuario extends Model<InferAttributes<Usuario>, InferCreationAttributes<Usuario>> {
  declare id_usuario: CreationOptional<number>;
  declare nombre_completo: string;
  declare email: string;
  declare password_hash: string;
  declare id_rol: number;
  declare estado: CreationOptional<EstadoActivo>;
  declare fecha_creacion: Date | null;

  static inicializar(sequelize: Sequelize): typeof Usuario {
    Usuario.init({
      id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre_completo: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      id_rol: { type: DataTypes.INTEGER, allowNull: false },
      estado: { type: DataTypes.ENUM('Activo', 'Inactivo'), defaultValue: 'Activo' },
      fecha_creacion: { type: DataTypes.DATE },
    }, { sequelize, modelName: 'Usuario', tableName: 'usuarios', timestamps: false });
    return Usuario;
  }
}

export default Usuario;
