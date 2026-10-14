require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes.js'));
app.use('/api/roles', require('./routes/roles.routes.js'));
app.use('/api/usuarios', require('./routes/usuarios.routes.js'));
app.get('/', (req,res)=> res.json({ok:true}));

const PORT = 4000;
app.listen(PORT, () => {
  console.log('Servidor en http://localhost:' + PORT);
});

sequelize.authenticate()
  .then(() => console.log('DB OK'))
  .catch(e => console.log('Error DB:', e.message));