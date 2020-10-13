// const { Pool } = require('pg')

// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     port: 5432,
//     database: 'postgres',
//     password: 'royalelephants'
// })

// module.exports = pool;

require('dotenv').config();

const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    dialect: 'postgres',
    host: process.env.DB_HOST,
  }
);

module.exports = sequelize;
