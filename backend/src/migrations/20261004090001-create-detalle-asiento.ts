import { DataTypes, QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> => {
    await queryInterface.createTable('detalle_asiento', {
      id_detalle_asiento: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_asiento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'asientos_contables',
          key: 'id_asiento',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      id_cuenta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cuentas_contables',
          key: 'id_cuenta',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      debe: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      haber: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('detalle_asiento');
  },
};
