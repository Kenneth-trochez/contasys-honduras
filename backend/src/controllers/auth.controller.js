const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario, Rol } = require('../models');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "Falta email o password" });
    }
    const usuario = await Usuario.findOne({ 
      where: { email }, 
      include: [{ model: Rol, as: 'roles' }] 
    });
    if (!usuario) {
      return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
    }
    if (usuario.estado === false || usuario.activo === false) {
      return res.status(403).json({ ok: false, message: "Usuario inactivo" });
    }
    const validPass = await bcrypt.compare(password, usuario.password);
    if (!validPass) {
      return res.status(401).json({ ok: false, message: "Credenciales inválidas" });
    }
    const roles = usuario.roles ? usuario.roles.map(r => r.nombre) : [];
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, roles },
      process.env.JWT_SECRET || 'contasys_secret_2026',
      { expiresIn: '8h' }
    );
    return res.status(200).json({
      ok: true,
      token,
      user: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, roles }
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Error en login" });
  }
};

const getMe = async (req, res) => {
  const usuario = await Usuario.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: [{ model: Rol, as: 'roles' }]
  });
  return res.status(200).json({ ok: true, usuario });
};

const getRoles = async (req, res) => {
  const roles = await Rol.findAll();
  return res.status(200).json({ ok: true, roles });
};

const getUsuarios = async (req, res) => {
  const usuarios = await Usuario.findAll({ 
    attributes: { exclude: ['password'] },
    include: [{ model: Rol, as: 'roles' }]
  });
  return res.status(200).json({ ok: true, usuarios });
};

const crearUsuario = async (req, res) => {
  const { nombre, email, password } = req.body;
  const existe = await Usuario.findOne({ where: { email } });
  if (existe) {
    return res.status(409).json({ ok: false, message: "Email ya registrado" });
  }
  const hash = await bcrypt.hash(password, 10);
  const nuevo = await Usuario.create({ nombre, email, password: hash });
  return res.status(201).json({ ok: true, usuario: nuevo });
};

module.exports = { login, getMe, getRoles, getUsuarios, crearUsuario };