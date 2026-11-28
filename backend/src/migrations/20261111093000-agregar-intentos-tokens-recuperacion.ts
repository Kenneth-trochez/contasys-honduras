import { DataTypes, QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const tablas = await queryInterface.showAllTables();

    if (!tablas.includes('tokens_recuperacion')) {
      await queryInterface.createTable('tokens_recuperacion', {
        id_token: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        id_usuario: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'id_usuario',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
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
      });
    }

    const columnas = await queryInterface.describeTable(
      'tokens_recuperacion'
    );

    if (!columnas.intentos) {
      await queryInterface.addColumn(
        'tokens_recuperacion',
        'intentos',
        {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        }
      );
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const columnas = await queryInterface.describeTable(
      'tokens_recuperacion'
    );

    if (columnas.intentos) {
      await queryInterface.removeColumn(
        'tokens_recuperacion',
        'intentos'
      );
    }
  },
};
