const Sequelize = require('sequelize');

// environment variables for production.
require('dotenv').config();

// Production DB
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    dialect: 'postgres',
    host: process.env.DB_HOST,
  }
);

// Local Development DB
// const sequelize = new Sequelize('Kleva', 'postgres', 'royalelephants', {
//   dialect: 'postgres',
//   host: 'localhost',
// });

module.exports = sequelize;
