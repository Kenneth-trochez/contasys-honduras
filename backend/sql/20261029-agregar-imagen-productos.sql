-- Sprint 3 / HU-14: columna para la ruta de la imagen del producto.
-- Ejecutar una sola vez sobre contasys_db (esquema v6). Los productos existentes quedan sin imagen (NULL).
ALTER TABLE productos
  ADD COLUMN imagen VARCHAR(255) NULL DEFAULT NULL AFTER estado;
