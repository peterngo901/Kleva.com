<<<<<<< HEAD
=======
// const { Pool } = require('pg')

// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     port: 5432,
//     database: 'postgres',
//     password: 'royalelephants'
// })

// module.exports = pool;

>>>>>>> 4fa02afae09d99680b2aa3a080c1daf137222d9f
const Sequelize = require('sequelize');

const sequelize = new Sequelize('Kleva', 'gabriel', '', {
    dialect: 'postgres',
    host: 'localhost'
});

module.exports = sequelize;
