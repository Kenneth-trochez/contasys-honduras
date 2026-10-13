const { Router } = require('express');
const { login, getMe, getRoles, getUsuarios, crearUsuario } = require('../controllers/auth.controller');
const verificarToken = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/roles.middleware');

const router = Router();

router.post('/login', login);
router.get('/me', verificarToken, getMe);
router.get('/roles', verificarToken, verificarRol('admin'), getRoles);
router.get('/usuarios', verificarToken, verificarRol('admin'), getUsuarios);
router.post('/usuarios', verificarToken, verificarRol('admin'), crearUsuario);

module.exports = router;