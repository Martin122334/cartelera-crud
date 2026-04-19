const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  director: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  genre: {
    type: DataTypes.ENUM(
      'Acción', 'Comedia', 'Drama', 'Terror',
      'Ciencia Ficción', 'Animación', 'Romance', 'Thriller'
    ),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,  
    allowNull: false
  },
  releaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0, max: 10 }
  },
  synopsis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'https://via.placeholder.com/300x450?text=Sin+imagen'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'movies'
});

module.exports = Movie;