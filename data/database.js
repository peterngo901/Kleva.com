// Dependencies
const Sequelize = require('sequelize');
require('dotenv').config();

// Deployed DB for Production.
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    dialect: 'postgres',
    host: process.env.DB_HOST,
  }
);

// DB for Local Development
// const sequelize = new Sequelize('Kleva', 'postgres', 'royalelephants', {
//   dialect: 'postgres',
//   host: 'localhost',
// });

module.exports = sequelize;
