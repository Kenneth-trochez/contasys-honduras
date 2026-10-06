module.exports = (sequelize, DataTypes) => {
  const Factura = sequelize.define('Factura', {
    id_factura: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero_factura: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },
    cai: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    fecha_emision: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    },
    id_tercero: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_usuario_emisor: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    impuesto_isv: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('Emitida', 'Anulada', 'Pagada'),
      defaultValue: 'Emitida'
    }
  }, {
    tableName: 'facturas',
    timestamps: false
  });

  return Factura;
};