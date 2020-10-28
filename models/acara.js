// Dependencies
const Sequelize = require('sequelize');
const sequelize = require('../data/database');

// ACARA unique id and it's corresponding EN term.
// E.G. 100, Molecules
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
