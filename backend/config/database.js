const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: require('better-sqlite3'),
  storage: process.env.DB_PATH || path.join(__dirname, '../database.sqlite'),
  logging: false
});

module.exports = sequelize;