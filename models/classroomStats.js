const Sequelize = require('sequelize');

const sequelize = require('../data/database');

const ClassroomStats = sequelize.define('classroomStats', {
  AverageStudentActivity: {
    type: Sequelize.INTEGER,
  },
  gameID: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = ClassroomStats;
