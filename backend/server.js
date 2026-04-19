const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const movieRoutes = require('./routes/movies');
const authRoutes = require('./routes/auth');   // ← nuevo
const User = require('./models/User');          // ← nuevo

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://Martin122334.github.io'  // ← reemplaza con tu usuario
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);              



app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

sequelize.sync({ alter: true })
  .then(async () => {
    console.log('✅ Base de datos sincronizada');

    const adminExists = await User.findOne({ where: { email: 'admin@cartelera.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Administrador',
        email: 'admin@cartelera.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('👤 Usuario admin creado: admin@cartelera.com / admin123');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor en http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('❌ Error:', err));