const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/movieController');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

const movieRules = [
  body('title').notEmpty().withMessage('El título es requerido').trim(),
  body('director').notEmpty().withMessage('El director es requerido').trim(),
  body('genre').notEmpty().withMessage('El género es requerido'),
  body('duration').isInt({ min: 1 }).withMessage('La duración debe ser un número positivo'),
  body('releaseDate').isDate().withMessage('Fecha de estreno inválida'),
  body('rating').isFloat({ min: 0, max: 10 }).withMessage('La calificación debe ser entre 0 y 10'),
];

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', authMiddleware, movieRules, validate, ctrl.create);
router.put('/:id', authMiddleware, movieRules, validate, ctrl.update);
router.delete('/:id', authMiddleware, ctrl.remove);

module.exports = router;