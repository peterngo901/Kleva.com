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
  gameFileURL: {
    type: Sequelize.STRING,
    allowNull: false
  },
  gameImageURL: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Game;