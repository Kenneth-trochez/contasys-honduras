import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize,
} from 'sequelize';

export class TokenRecuperacion extends Model<
    InferAttributes<TokenRecuperacion>,
    InferCreationAttributes<TokenRecuperacion>
> {
    declare id_token: CreationOptional<number>;
    declare id_usuario: number;
    declare token: string;
    declare fecha_expiracion: Date;
    declare usado: CreationOptional<boolean>
    declare intentos: CreationOptional<number>;


    static inicializar(sequelize: Sequelize): typeof TokenRecuperacion {
        TokenRecuperacion.init(
            {
                id_token: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                id_usuario: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                token: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    unique: true,
                },
                fecha_expiracion: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                usado: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                intentos: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
            },
            {
                sequelize,
                modelName: 'TokenRecuperacion',
                tableName: 'tokens_recuperacion',
                timestamps: false,
            }
        );

        return TokenRecuperacion;
    }
}

export default TokenRecuperacion;
