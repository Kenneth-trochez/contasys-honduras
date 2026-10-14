const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ ok: false, message: "Token inválido - falta Bearer" });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, message: "Token inválido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'contasys_secret_2024');
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ ok: false, message: "Token expirado" });
    }
    return res.status(401).json({ ok: false, message: "Token inválido" });
  }
};