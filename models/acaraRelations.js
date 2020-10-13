const Sequelize = require('sequelize');

const sequelize = require('../data/database');

// New Model define()

const AcaraRelations = sequelize.define(
  'acara_relations',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: true,
      primaryKey: true,
    },
    broaderOne: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    broaderTwo: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    broaderThree: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    narrowerTerms: {
      type: Sequelize.STRING(15000),
      allowNull: true,
    },
  },
  { timestamps: false }
);

module.exports = AcaraRelations;
