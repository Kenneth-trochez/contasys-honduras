module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('asientos_contables', {
      id_asiento: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      numero_asiento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      fecha_asiento: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      concepto: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      id_usuario_registro: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id_usuario',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      estado: {
        type: Sequelize.ENUM('Borrador', 'Publicado', 'Anulado'),
        allowNull: false,
        defaultValue: 'Publicado',
      },
      fecha_registro: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('asientos_contables');
  },
};
