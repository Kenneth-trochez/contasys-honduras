require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const asientosRoutes = require('./routes/asientos');
const facturaRoutes = require('./routes/factura.routes');
const tercerosRoutes = require('./routes/terceros');
const cuentasRoutes = require('./routes/cuentas');
const productosRoutes = require('./routes/productos');
const movimientosRoutes = require('./routes/movimientos');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes.js'));
app.use('/api/roles', require('./routes/roles.routes.js'));
app.use('/api/usuarios', require('./routes/usuarios.routes.js'));
app.get('/', (req,res)=> res.json({ok:true}));
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ContaSys API funcionando',
  });
});

app.use('/api/asientos', asientosRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/terceros', tercerosRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/inventario', movimientosRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log('Servidor en http://localhost:' + PORT);
});

sequelize.authenticate()
  .then(() => console.log('DB OK'))
  .catch(e => console.log('Error DB:', e.message));