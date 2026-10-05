const FacturaService = require('../services/factura.service');

exports.obtenerFacturas = async (req, res) => {
  try {
    const facturas = await FacturaService.listarFacturas();
    res.status(200).json(facturas);
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message || "Error al obtener facturas" });
  }
};

exports.obtenerFacturaPorId = async (req, res) => {
  try {
    const factura = await FacturaService.obtenerPorId(req.params.id);
    res.status(200).json(factura);
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message });
  }
};

exports.crearFactura = async (req, res) => {
  try {
    const nuevaFactura = await FacturaService.crearFactura(req.body);
    res.status(201).json(nuevaFactura);
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message });
  }
};

exports.cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const facturaActualizada = await FacturaService.cambiarEstado(req.params.id, estado);
    res.status(200).json({ mensaje: "Estado actualizado", factura: facturaActualizada });
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message });
  }
};