module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre_completo: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    id_rol: { type: DataTypes.INTEGER, allowNull: false },
    estado: { type: DataTypes.ENUM('Activo','Inactivo'), defaultValue: 'Activo' },
    fecha_creacion: { type: DataTypes.DATE }
  }, { tableName: 'usuarios', timestamps: false });
  return Usuario;
};