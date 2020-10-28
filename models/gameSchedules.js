// Dependencies
const Sequelize = require('sequelize');
const sequelize = require('../data/database');

// Game Schedule Model
const gameSchedule = sequelize.define('gameSchedule', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  classCode: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  gameList: {
    type: Sequelize.ARRAY(Sequelize.TEXT),
  },
  date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
});

module.exports = gameSchedule;
