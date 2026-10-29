import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import sequelize from './config/database';
import asientosRoutes from './routes/asientos';
import facturaRoutes from './routes/factura.routes';
import tercerosRoutes from './routes/terceros';
import cuentasRoutes from './routes/cuentas';
import productosRoutes from './routes/productos';
import movimientosRoutes from './routes/movimientos';
import authRoutes from './routes/auth.routes';
import rolesRoutes from './routes/roles.routes';
import usuariosRoutes from './routes/usuarios.routes';
import passport from './config/passport';
import { CARPETA_UPLOADS, RUTA_PUBLICA_UPLOADS } from './config/archivos';

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.get('/', (_req: Request, res: Response) => { res.json({ ok: true }); });
app.get('/api/health', (_req: Request, res: Response) => {
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

// Imágenes subidas (p. ej. GET /uploads/productos/<archivo>.jpg)
app.use(RUTA_PUBLICA_UPLOADS, express.static(CARPETA_UPLOADS));

const PORT = 4000;
app.listen(PORT, () => {
  console.log('Servidor en http://localhost:' + PORT);
});

sequelize.authenticate()
  .then(() => console.log('DB OK'))
  .catch((e: Error) => console.log('Error DB:', e.message));
