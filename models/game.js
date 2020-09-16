const Sequelize = require('sequelize');

const sequelize = require('../data/database');

const Game = sequelize.define('games', {
  gameID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  gameFile: {
    type: Sequelize.BLOB('long'),
    allowNull: false
  }
});

module.exports = Game;