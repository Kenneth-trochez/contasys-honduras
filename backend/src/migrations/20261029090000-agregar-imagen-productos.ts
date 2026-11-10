import { DataTypes, QueryInterface } from 'sequelize';

// Sprint 3 / HU-14: ruta de la imagen del producto (equivale a sql/20261029-agregar-imagen-productos.sql).
module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> => {
    await queryInterface.addColumn('productos', 'imagen', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn('productos', 'imagen');
  },
};
