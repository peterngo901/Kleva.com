const Sequelize = require('sequelize');

const sequelize = require('../data/database');

const Session = sequelize.define("Session", {
  sid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  userId: Sequelize.STRING,
  expires: Sequelize.DATE,
  data: Sequelize.STRING(50000),
});

module.exports = Session;