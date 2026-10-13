// Middleware de roles  HU-01 y HU-04
const autorizarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, message: "No autenticado" });
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ ok: false, message: "Sin permiso" });
    }
    next();
  };
};

module.exports = { autorizarRol };