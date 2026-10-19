import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class Rol extends Model<InferAttributes<Rol>, InferCreationAttributes<Rol>> {
  declare id_rol: CreationOptional<number>;
  declare nombre_rol: string;
  declare descripcion: string | null;

  static inicializar(sequelize: Sequelize): typeof Rol {
    Rol.init({
      id_rol: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre_rol: { type: DataTypes.STRING(50), allowNull: false },
      descripcion: { type: DataTypes.STRING(255) },
    }, { sequelize, modelName: 'Rol', tableName: 'roles', timestamps: false });
    return Rol;
  }
}

export default Rol;
