// Middleware de autenticación HU-02
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ ok: false, message: "No autenticado" });

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_contasys');
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ ok: false, message: "Token inválido o expiró" });
  }
};

module.exports = { verificarToken };