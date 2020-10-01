const Sequelize = require('sequelize');

const sequelize = require('../data/database');

const ClassroomStats = sequelize.define('classroomStats', {
  classCode: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  AverageStudentActivity: {
    type: Sequelize.INTEGER,
  },
  gameID: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  gameTitle: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  gameCategory: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  teacherEmail: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = ClassroomStats;
