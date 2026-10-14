const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const authMiddleware = require('../middlewares/auth.middleware');

// GET /api/roles
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [roles] = await sequelize.query('SELECT * FROM roles');
    res.json({ ok: true, roles });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
});

module.exports = router;