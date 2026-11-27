import { DataTypes, QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> => {
    await queryInterface.createTable('terceros', {
      id_tercero: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      tipo_tercero: {
        type: Sequelize.ENUM('Cliente', 'Proveedor', 'Ambos'),
        allowNull: false,
      },
      nombre_razon_social: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      rtn: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      direccion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      estado: {
        type: Sequelize.ENUM('Activo', 'Inactivo'),
        allowNull: false,
        defaultValue: 'Activo',
      },
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('terceros');
  },
};
