const Sequelize = require('sequelize');

const sequelize = require('../data/database');

// New Model define()

const Acara = sequelize.define(
  'acara',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: true,
      primaryKey: true,
    },
    term: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  { timestamps: false }
);

module.exports = Acara;
