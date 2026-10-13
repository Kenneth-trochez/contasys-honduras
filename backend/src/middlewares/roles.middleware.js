const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    const rolesUsuario = req.user?.roles || [];
    const tienePermiso = rolesUsuario.some(r => rolesPermitidos.includes(r));
    if (!tienePermiso) {
      return res.status(403).json({ ok: false, message: "No tienes permisos para esta acción" });
    }
    next();
  };
};

module.exports = verificarRol;