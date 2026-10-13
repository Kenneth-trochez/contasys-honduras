const jwt = require('jsonwebtoken');

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: "Falta email o password" });
  }

  if (email !== "admin@contasys.hn") {
    return res.status(401).json({ ok: false, message: "Credenciales inválidas" });
  }

  const user = {
    id: 1,
    nombre: "Administrador",
    email: "admin@contasys.hn",
    role: "Administrador"
  };

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "contasys_secret_2026",
    { expiresIn: "8h" }
  );

  return res.json({
    ok: true,
    token,
    user
  });
};

const me = (req, res) => {
  return res.json({ ok: true, user: req.user });
};

module.exports = { login, me };