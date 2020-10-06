const Sequelize = require('sequelize');

const sequelize = require('../data/database');

const ClassroomStats = sequelize.define('classroomStats', {
  gameID: { //gameID and classroomClassCode make a composite primary key
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  classroomClassCode: { //gameID and classroomClassCode make a composite primary key
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
    AverageStudentActivity: {
    type: Sequelize.INTEGER,
  },
});

module.exports = ClassroomStats;
