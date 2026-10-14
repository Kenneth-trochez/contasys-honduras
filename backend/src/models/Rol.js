module.exports = (sequelize, DataTypes) => {
  const Rol = sequelize.define('Rol', {
    id_rol: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre_rol: { type: DataTypes.STRING(50), allowNull: false },
    descripcion: { type: DataTypes.STRING(255) }
  }, { tableName: 'roles', timestamps: false });
  return Rol;
};