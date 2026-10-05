const { Factura, DetalleFactura, Tercero, Inventario, sequelize } = require('../models');

const TASA_ISV = 0.15;

class FacturaService {

  static calcularTotales(detalles) {
    let subtotal = 0;
    const detallesProcesados = detalles.map(det => {
      const subtotalItem = Number((det.cantidad * det.precioUnitario).toFixed(2));
      subtotal += subtotalItem;
      return { ...det, subtotal: subtotalItem };
    });

    const isv = Number((subtotal * TASA_ISV).toFixed(2));
    const total = Number((subtotal + isv).toFixed(2));

    return { subtotal, isv, total, detallesProcesados };
  }

  static async crear(data) {
    const transaction = await sequelize.transaction();
    try {
      const tercero = await Tercero.findByPk(data.terceroId, { transaction });
      if (!tercero) {
        const err = new Error('El tercero especificado no existe.');
        err.status = 404;
        throw err;
      }

      const existeFactura = await Factura.findOne({ where: { numeroFactura: data.numeroFactura }, transaction });
      if (existeFactura) {
        const err = new Error('El número de factura ya se encuentra registrado.');
        err.status = 409;
        throw err;
      }

      const { subtotal, isv, total, detallesProcesados } = this.calcularTotales(data.detalles);

      const nuevaFactAquí tienes la implementación técnica completa y lista para ser integrada en el proyecto backend **ContaSys** (Node.js / Express / Sequelize o Prisma / MySQL), cumpliendo rigurosamente con todas las reglas de negocio, validaciones y pruebas solicitadas.

---

### 1. Modelo de Datos (Database Schema)

Si usas SQL puro o Sequelize/Prisma, la estructura relacional requiere dos tablas principales: `facturas` y `factura_detalles`.

```sql
CREATE TABLE facturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_factura VARCHAR(50) UNIQUE NOT NULL,
  cai VARCHAR(100) NOT NULL,
  tercero_id INT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('EMITIDA', 'ANULADA') DEFAULT 'EMITIDA',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  isv DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tercero_id) REFERENCES terceros(id)
);

CREATE TABLE factura_detalles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  factura_id INT NOT NULL,
  producto_id INT NULL, -- Opcional según módulo de inventario
  descripcion VARCHAR(255) NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE
);