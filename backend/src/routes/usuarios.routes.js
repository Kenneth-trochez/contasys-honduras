const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const authMiddleware = require('../middlewares/auth.middleware');
const bcrypt = require('bcryptjs');

// 1. GET /api/usuarios - Listar todos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [usuarios] = await sequelize.query('SELECT id_usuario, nombre_completo, email, id_rol, estado FROM usuarios');
    res.json({ ok: true, usuarios });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
});

// 2. POST /api/usuarios - Crear (Ya lo tienes con 201 y 409)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre_completo, email, password, id_rol } = req.body;
    if (!nombre_completo ||!email ||!password ||!id_rol) {
      return res.status(400).json({ ok: false, message: 'Faltan datos' });
    }
    const [existe] = await sequelize.query(`SELECT id_usuario FROM usuarios WHERE email = '${email}'`);
    if (existe.length > 0) {
      return res.status(409).json({ ok: false, message: 'Email duplicado' });
    }
    const hash = await bcrypt.hash(password, 10);
    await sequelize.query(
      `INSERT INTO usuarios (nombre_completo, email, password_hash, id_rol, estado, fecha_creacion) VALUES ('${nombre_completo}', '${email}', '${hash}', ${id_rol}, 'Activo', NOW())`
    );
    res.status(201).json({ ok: true, message: 'Usuario creado correctamente' });
  } catch (e) {
    console.log(e);
    res.status(500).json({ ok: false, message: e.message });
  }
});

// 3. PUT /api/usuarios/:id - Editar usuario
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_completo, email, id_rol } = req.body;

    if(!nombre_completo ||!email ||!id_rol){
      return res.status(400).json({ ok: false, message: 'Faltan datos' });
    }

    // Validar email duplicado pero que no sea el mismo usuario
    const [existe] = await sequelize.query(`SELECT id_usuario FROM usuarios WHERE email = '${email}' AND id_usuario!= ${id}`);
    if (existe.length > 0) {
      return res.status(409).json({ ok: false, message: 'Email duplicado' });
    }

    await sequelize.query(`UPDATE usuarios SET nombre_completo='${nombre_completo}', email='${email}', id_rol=${id_rol} WHERE id_usuario=${id}`);

    res.json({ ok: true, message: 'Usuario actualizado correctamente' });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
});

// 4. PATCH /api/usuarios/:id/estado - Activar / Desactivar
router.patch('/:id/estado', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body; // Debe ser 'Activo' o 'Inactivo'

    if(estado!== 'Activo' && estado!== 'Inactivo'){
      return res.status(400).json({ ok: false, message: 'Estado debe ser Activo o Inactivo' });
    }

    await sequelize.query(`UPDATE usuarios SET estado='${estado}' WHERE id_usuario=${id}`);

    res.json({ ok: true, message: `Usuario ${estado} correctamente` });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
});

module.exports = router;