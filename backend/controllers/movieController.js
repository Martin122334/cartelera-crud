const Movie = require('../models/Movie');

// GET /api/movies — Listar todas
exports.getAll = async (req, res) => {
  try {
    const { genre, search } = req.query;
    const where = { isActive: true };

    if (genre) where.genre = genre;
    if (search) {
      const { Op } = require('sequelize');
      where.title = { [Op.like]: `%${search}%` };
    }

    const movies = await Movie.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: movies, total: movies.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener películas', error: error.message });
  }
};

// GET /api/movies/:id — Obtener una
exports.getOne = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Película no encontrada' });
    res.json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener película' });
  }
};

// POST /api/movies — Crear
exports.create = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, data: movie, message: 'Película creada correctamente' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error al crear película', error: error.message });
  }
};

// PUT /api/movies/:id — Actualizar
exports.update = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Película no encontrada' });
    await movie.update(req.body);
    res.json({ success: true, data: movie, message: 'Película actualizada correctamente' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error al actualizar película' });
  }
};

// DELETE /api/movies/:id — Eliminar 
exports.remove = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Película no encontrada' });
    await movie.update({ isActive: false });
    res.json({ success: true, message: 'Película eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar película' });
  }
};