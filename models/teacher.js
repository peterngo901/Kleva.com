// Dependencies
const Sequelize = require('sequelize');
const sequelize = require('../data/database');

// Teacher Model
const Teacher = sequelize.define('teacher', {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  school: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  teacherID: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  postcode: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Teacher;
