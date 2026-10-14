const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    const usuario = req.user || req.usuario;

    if (!usuario) {
      return res.status(401).json({
        ok: false,
        message: 'No autenticado'
      });
    }

    const rolActual = typeof usuario.rol === 'string'
      ? usuario.rol
      : usuario.Rol?.nombre || usuario.rol?.nombre || usuario.rol_nombre;

    const rolId = Number(usuario.rol_id);

    const tienePermiso = rolesPermitidos.some((rol) => {
      if (typeof rol === 'number') {
        return rol === rolId;
      }

      const rolSolicitado = rol.toLowerCase();
      const rolUsuario = (rolActual || '').toLowerCase();

      return rolSolicitado === rolUsuario ||
        (rolSolicitado === 'admin' && rolUsuario === 'administrador');
    });

    if (!tienePermiso) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permiso para esta acción'
      });
    }

    next();
  };
};

module.exports = verificarRol;
