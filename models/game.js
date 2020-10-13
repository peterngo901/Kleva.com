const Sequelize = require('sequelize');

const sequelize = require('../data/database');

const Game = sequelize.define('games', {
  gameID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  subCategory: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  gameFileURL: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  gameImageURL: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  // totalPopularity: {
  //   type: Sequelize.FLOAT
  // },
  // teacherPopularity: {
  //   type: Sequelize.FLOAT
  // },
  // totalStudentPopularity: {
  //   type: Sequelize.FLOAT
  // },
  // year7Popularity: {
  //   type: Sequelize.FLOAT
  // },
  // year8Popularity: {
  //   type: Sequelize.FLOAT
  // },
  // year9Popularity: {
  //   type: Sequelize.FLOAT
  // },
});

module.exports = Game;
