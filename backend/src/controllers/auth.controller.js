const { Usuario, Rol } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email y password son requeridos' });
    }

    const usuario = await Usuario.findOne({ 
      where: { email }, 
      include: [{ model: Rol, as: 'rol' }] 
    });

    if (!usuario) return res.status(404).json({ ok: false, message: "Usuario no existe" });
    if (usuario.estado === 'Inactivo') return res.status(403).json({ ok: false, message: "Usuario inactivo" });

    const valid = await bcrypt.compare(password, usuario.password_hash);
    if (!valid) return res.status(401).json({ ok: false, message: "Password incorrecta" });

    const token = jwt.sign(
      { id: usuario.id_usuario, id_rol: usuario.id_rol },
      process.env.JWT_SECRET || 'contasys_secret_2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.json({ ok: true, token, usuario: { id_usuario: usuario.id_usuario, nombre_completo: usuario.nombre_completo, email: usuario.email, rol: usuario.rol } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: error.message });
  }
};

const me = async (req, res) => {
  const usuario = await Usuario.findByPk(req.user.id, { attributes: ['id_usuario','nombre_completo','email','id_rol','estado'], include: [{ model: Rol, as: 'rol' }] });
  return res.json({ ok: true, usuario });
};

module.exports = { login, me };