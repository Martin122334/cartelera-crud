const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secreto';

// Base de datos JSON
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ movies: [], users: [] }).write();

app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Middleware JWT ────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token requerido' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ success: false, message: 'Token inválido' });
  }
};

// ── AUTH ─────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    if (db.get('users').find({ email }).value())
      return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: uuidv4(), name, email, password: hashed, role: 'user' };
    db.get('users').push(user).write();
    const token = jwt.sign({ id: user.id, email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ success: true, token, user: { id: user.id, name, email, role: user.role } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error al registrar' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.get('users').find({ email }).value();
    if (!user) return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    const token = jwt.sign({ id: user.id, email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, message: 'Login exitoso', user: { id: user.id, name: user.name, email, role: user.role } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error al iniciar sesión' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.get('users').find({ id: req.user.id }).value();
  if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// ── MOVIES ────────────────────────────────────────────────
app.get('/api/movies', (req, res) => {
  try {
    const { genre, search } = req.query;
    let movies = db.get('movies').filter({ isActive: true }).value();
    if (genre) movies = movies.filter(m => m.genre === genre);
    if (search) movies = movies.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
    movies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: movies, total: movies.length });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error al obtener películas' });
  }
});

app.get('/api/movies/:id', (req, res) => {
  const movie = db.get('movies').find({ id: req.params.id, isActive: true }).value();
  if (!movie) return res.status(404).json({ success: false, message: 'Película no encontrada' });
  res.json({ success: true, data: movie });
});

app.post('/api/movies', authMiddleware, (req, res) => {
  try {
    const { title, director, genre, duration, releaseDate, rating, synopsis, imageUrl } = req.body;
    if (!title || !director || !genre || !duration || !releaseDate || rating === undefined)
      return res.status(422).json({ success: false, message: 'Faltan campos requeridos' });
    const movie = {
      id: uuidv4(), title, director, genre,
      duration: Number(duration), releaseDate,
      rating: Number(rating), synopsis: synopsis || '',
      imageUrl: imageUrl || 'https://via.placeholder.com/300x450?text=Sin+imagen',
      isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    db.get('movies').push(movie).write();

    // Crear admin por defecto si no existe
    res.status(201).json({ success: true, data: movie, message: 'Película creada correctamente' });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Error al crear película' });
  }
});

app.put('/api/movies/:id', authMiddleware, (req, res) => {
  try {
    const movie = db.get('movies').find({ id: req.params.id }).value();
    if (!movie) return res.status(404).json({ success: false, message: 'Película no encontrada' });
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    db.get('movies').find({ id: req.params.id }).assign(updates).write();
    const updated = db.get('movies').find({ id: req.params.id }).value();
    res.json({ success: true, data: updated, message: 'Película actualizada correctamente' });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Error al actualizar' });
  }
});

app.delete('/api/movies/:id', authMiddleware, (req, res) => {
  try {
    const movie = db.get('movies').find({ id: req.params.id }).value();
    if (!movie) return res.status(404).json({ success: false, message: 'Película no encontrada' });
    db.get('movies').find({ id: req.params.id }).assign({ isActive: false }).write();
    res.json({ success: true, message: 'Película eliminada correctamente' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error al eliminar' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Crear admin por defecto
async function createAdmin() {
  const exists = db.get('users').find({ email: 'admin@cartelera.com' }).value();
  if (!exists) {
    const hashed = await bcrypt.hash('admin123', 10);
    db.get('users').push({
      id: uuidv4(), name: 'Administrador',
      email: 'admin@cartelera.com', password: hashed, role: 'admin'
    }).write();
    console.log('👤 Admin creado: admin@cartelera.com / admin123');
  }
}

createAdmin().then(() => {
  app.listen(PORT, () => console.log(`🚀 Servidor en http://0.0.0.0:${PORT}`));
});