// Dependencies
const Sequelize = require('sequelize');
const sequelize = require('../data/database');

// Question Bank Model
const questionBank = sequelize.define('questionBank', {
  teacherEmail: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  classCode: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  questions: {
    type: Sequelize.ARRAY(Sequelize.TEXT),
  },
});

module.exports = questionBank;
