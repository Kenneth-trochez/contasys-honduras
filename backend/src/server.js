require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const asientosRoutes = require('./routes/asientos');
const facturaRoutes = require('./routes/factura.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ContaSys API funcionando',
  });
});

app.use('/api/asientos', asientosRoutes);
app.use('/api/facturas', facturaRoutes);

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log('Conexión a MySQL establecida correctamente.');

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar con MySQL:');
    console.error(error.message);
    process.exit(1);
  }
}

startServer();