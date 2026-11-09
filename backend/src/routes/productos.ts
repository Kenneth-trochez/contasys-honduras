import { Router } from 'express';
import * as controller from '../controllers/inventarioController';
import authMiddleware from '../middlewares/auth.middleware';
import verificarRol from '../middlewares/roles.middleware';
import { subirImagenProducto } from '../middlewares/subirImagen';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Inventario - Productos
 *     description: Catálogo de productos, su estado y su imagen. No existe DELETE; los productos solo se desactivan.
 *   - name: Inventario - Movimientos
 *     description: Entradas, salidas y ajustes de stock, y su historial.
 *
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       properties:
 *         idProducto: { type: integer, example: 6 }
 *         codigoProducto: { type: string, maxLength: 50, example: PRD-001 }
 *         nombreProducto: { type: string, maxLength: 150, example: Resma papel carta }
 *         descripcion: { type: string, maxLength: 255, nullable: true, example: Papel bond 75 g }
 *         imagen:
 *           type: string
 *           nullable: true
 *           description: Ruta relativa de la imagen. Se ve en http://localhost:4000/ + esta ruta.
 *           example: uploads/productos/6-1793248729938-7f629623.jpg
 *         precioCompra: { type: string, description: Decimal con 2 cifras, example: "80.00" }
 *         precioVenta: { type: string, description: Decimal con 2 cifras, example: "125.00" }
 *         stockActual: { type: string, description: Solo cambia con movimientos, example: "25.00" }
 *         stockMinimo: { type: string, example: "5.00" }
 *         estado: { type: string, enum: [Activo, Inactivo], example: Activo }
 *         fechaCreacion: { type: string, format: date-time, example: "2026-10-29T04:38:48.000Z" }
 *     ProductoNuevo:
 *       type: object
 *       required: [codigoProducto, nombreProducto, precioVenta]
 *       properties:
 *         codigoProducto: { type: string, maxLength: 50, example: PRD-001 }
 *         nombreProducto: { type: string, maxLength: 150, example: Resma papel carta }
 *         descripcion: { type: string, maxLength: 255, nullable: true, example: Papel bond 75 g }
 *         precioCompra: { type: number, minimum: 0, default: 0, example: 80 }
 *         precioVenta: { type: number, exclusiveMinimum: true, minimum: 0, example: 125 }
 *         stockMinimo: { type: number, minimum: 0, default: 0, example: 5 }
 *     ProductoEdicion:
 *       type: object
 *       description: Todos los campos son opcionales. codigoProducto y stockActual no se pueden editar (se ignoran).
 *       properties:
 *         nombreProducto: { type: string, maxLength: 150, example: Resma papel carta 75 g }
 *         descripcion: { type: string, maxLength: 255, nullable: true, example: Paquete de 500 hojas }
 *         precioCompra: { type: number, minimum: 0, example: 85 }
 *         precioVenta: { type: number, exclusiveMinimum: true, minimum: 0, example: 130 }
 *         stockMinimo: { type: number, minimum: 0, example: 10 }
 *     MovimientoNuevo:
 *       type: object
 *       required: [idProducto, cantidad]
 *       properties:
 *         idProducto: { type: integer, example: 6 }
 *         cantidad:
 *           type: number
 *           description: Mayor que 0 en entradas y salidas. En ajustes puede ser negativa, pero no puede dejar el stock en negativo.
 *           example: 50
 *         motivo: { type: string, maxLength: 255, nullable: true, example: Compra inicial }
 *     MovimientoInventario:
 *       type: object
 *       properties:
 *         idMovimiento: { type: integer, example: 12 }
 *         idProducto: { type: integer, example: 6 }
 *         tipoMovimiento: { type: string, enum: [Entrada, Salida, Ajuste], example: Entrada }
 *         cantidad: { type: string, example: "50.00" }
 *         motivo: { type: string, nullable: true, example: Compra inicial }
 *         idUsuario: { type: integer, description: Usuario del token que registró el movimiento, example: 1 }
 *         fechaMovimiento: { type: string, format: date-time, example: "2026-10-29T04:38:50.000Z" }
 *     ErrorInventario:
 *       type: object
 *       properties:
 *         ok: { type: boolean, example: false }
 *         message: { type: string, example: Datos inválidos }
 *         errors:
 *           type: array
 *           nullable: true
 *           description: Lista de problemas cuando hay varios errores de validación.
 *           items: { type: string }
 *           example: ["nombreProducto es obligatorio", "precioVenta debe ser mayor que 0"]
 *
 *   responses:
 *     InventarioErrorValidacion:
 *       description: Datos inválidos
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ErrorInventario' }
 *     InventarioNoAutenticado:
 *       description: Sin token, token inválido o expirado
 *       content:
 *         application/json:
 *           example: { ok: false, message: "Token inválido, expirado o usuario inactivo" }
 *     InventarioSinPermiso:
 *       description: El rol del usuario no tiene permiso
 *       content:
 *         application/json:
 *           example: { ok: false, message: No tienes permiso para esta acción }
 *     InventarioNoEncontrado:
 *       description: El producto no existe
 *       content:
 *         application/json:
 *           example: { ok: false, message: Producto no encontrado }
 *     InventarioErrorInterno:
 *       description: Error interno del servidor
 *       content:
 *         application/json:
 *           example: { ok: false, message: Error interno del servidor }
 *
 *   parameters:
 *     IdProducto:
 *       in: path
 *       name: id
 *       required: true
 *       schema: { type: integer, minimum: 1 }
 *       description: Identificador del producto (idProducto)
 */

/**
 * @swagger
 * /api/productos:
 *   get:
 *     tags: [Inventario - Productos]
 *     summary: Listar productos
 *     description: "Roles: Administrador, Contador, Auxiliar Contable. Ordenados por nombre."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Busca por nombre o código (coincidencia parcial)
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [Activo, Inactivo] }
 *         description: Filtra por estado. Otro valor responde 400.
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Producto' }
 *       400: { $ref: '#/components/responses/InventarioErrorValidacion' }
 *       401: { $ref: '#/components/responses/InventarioNoAutenticado' }
 *       403: { $ref: '#/components/responses/InventarioSinPermiso' }
 *       500: { $ref: '#/components/responses/InventarioErrorInterno' }
 */
router.get('/', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), controller.listarProductos);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     tags: [Inventario - Productos]
 *     summary: Obtener un producto
 *     description: "Roles: Administrador, Contador, Auxiliar Contable."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdProducto'
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Producto' }
 *       401: { $ref: '#/components/responses/InventarioNoAutenticado' }
 *       403: { $ref: '#/components/responses/InventarioSinPermiso' }
 *       404: { $ref: '#/components/responses/InventarioNoEncontrado' }
 *       500: { $ref: '#/components/responses/InventarioErrorInterno' }
 */
router.get('/:id', authMiddleware, verificarRol('administrador','contador','auxiliar contable'), controller.obtenerProducto);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     tags: [Inventario - Productos]
 *     summary: Crear un producto
 *     description: "Roles: Administrador, Contador. El producto se crea con stockActual 0, estado Activo y sin imagen. Si hay varios errores, se devuelven todos juntos en `errors`."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductoNuevo' }
 *     responses:
 *       201:
 *         description: Producto creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Producto' }
 *       400: { $ref: '#/components/responses/InventarioErrorValidacion' }
 *       401: { $ref: '#/components/responses/InventarioNoAutenticado' }
 *       403: { $ref: '#/components/responses/InventarioSinPermiso' }
 *       409:
 *         description: El código de producto ya existe
 *         content:
 *           application/json:
 *             example: { ok: false, message: El código de producto ya existe }
 *       500: { $ref: '#/components/responses/InventarioErrorInterno' }
 */
router.post('/', authMiddleware, verificarRol('administrador','contador'), controller.crearProducto);

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     tags: [Inventario - Productos]
 *     summary: Editar un producto
 *     description: "Roles: Administrador, Contador. Solo cambia los campos enviados. El código y el stock no se editan aquí."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdProducto'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductoEdicion' }
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Producto' }
 *       400: { $ref: '#/components/responses/InventarioErrorValidacion' }
 *       401: { $ref: '#/components/responses/InventarioNoAutenticado' }
 *       403: { $ref: '#/components/responses/InventarioSinPermiso' }
 *       404: { $ref: '#/components/responses/InventarioNoEncontrado' }
 *       500: { $ref: '#/components/responses/InventarioErrorInterno' }
 */
router.put('/:id', authMiddleware, verificarRol('administrador','contador'), controller.actualizarProducto);

/**
 * @swagger
 * /api/productos/{id}/imagen:
 *   post:
 *     tags: [Inventario - Productos]
 *     summary: Subir o reemplazar la imagen de un producto
 *     description: |
 *       Roles: Administrador, Contador.
 *
 *       - Solo JPEG o PNG, máximo 5 MB. Se verifica que el archivo sea una imagen real.
 *       - Sharp la escala a 800 × 800 px como máximo, sin deformarla ni agrandarla.
 *       - Se guarda en backend/uploads/productos/ con nombre único y la ruta queda en el campo `imagen`.
 *       - Si el producto ya tenía imagen, la anterior se borra.
 *       - La imagen se ve en http://localhost:4000/ + el valor de `imagen`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdProducto'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [imagen]
 *             properties:
 *               imagen:
 *                 type: string
 *                 format: binary
 *                 description: Archivo JPEG o PNG de hasta 5 MB
 *     responses:
 *       201:
 *         description: Imagen guardada y asociada al producto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Producto' }
 *                 imagen:
 *                   type: object
 *                   properties:
 *                     ruta: { type: string, example: uploads/productos/6-1793248729938-7f629623.jpg }
 *                     ancho: { type: integer, example: 800 }
 *                     alto: { type: integer, example: 600 }
 *                     bytes: { type: integer, example: 48213 }
 *       400:
 *         description: Sin archivo, formato no permitido, archivo mayor de 5 MB o archivo que no es una imagen real
 *         content:
 *           application/json:
 *             example: { ok: false, message: "Formato no permitido: solo se aceptan imágenes JPEG o PNG" }
 *       401: { $ref: '#/components/responses/InventarioNoAutenticado' }
 *       403: { $ref: '#/components/responses/InventarioSinPermiso' }
 *       404: { $ref: '#/components/responses/InventarioNoEncontrado' }
 *       500: { $ref: '#/components/responses/InventarioErrorInterno' }
 */
router.post('/:id/imagen', authMiddleware, verificarRol('administrador','contador'), subirImagenProducto, controller.subirImagenProducto);

/**
 * @swagger
 * /api/productos/{id}/estado:
 *   patch:
 *     tags: [Inventario - Productos]
 *     summary: Activar o desactivar un producto
 *     description: "Roles: Administrador, Contador. No existe DELETE: los productos solo se desactivan. Un producto inactivo no acepta movimientos."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdProducto'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado: { type: string, enum: [Activo, Inactivo], example: Inactivo }
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Producto' }
 *       400: { $ref: '#/components/responses/InventarioErrorValidacion' }
 *       401: { $ref: '#/components/responses/InventarioNoAutenticado' }
 *       403: { $ref: '#/components/responses/InventarioSinPermiso' }
 *       404: { $ref: '#/components/responses/InventarioNoEncontrado' }
 *       500: { $ref: '#/components/responses/InventarioErrorInterno' }
 */
router.patch('/:id/estado', authMiddleware, verificarRol('administrador','contador'), controller.cambiarEstadoProducto);

export default router;
