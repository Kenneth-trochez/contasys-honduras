
const express = require('express');
const router = express.Router();

const terceroController = require('../controllers/tercero.controller');

router.get('/', terceroController.listar);

router.get('/:id', terceroController.obtenerPorId);

router.post('/', terceroController.crear);

router.put('/:id', terceroController.actualizar);

router.patch('/:id/estado', terceroController.cambiarEstado);

module.exports = router;
