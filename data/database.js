const Sequelize = require('sequelize');

const sequelize = new Sequelize('Kleva', 'gabriel', '', {
    dialect: 'postgres',
    host: 'localhost'
});

module.exports = sequelize;
