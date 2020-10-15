const Sequelize = require('sequelize');

const sequelize = require('../data/database');

// New Model define()

const Curriculum = sequelize.define(
  'curriculum',
  {
    subject: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    strand: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    description: {
      type: Sequelize.DataTypes.STRING(50000),
      allowNull: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    yearLevelOne: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    yearLevelTwo: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    yearLevelThree: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    isChildOfOne: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aboutID: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    skillOne: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    skillTwo: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    skillThree: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    skillFour: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    skillFive: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    skillSix: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    skillSeven: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    skillEight: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    curriculumCode: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    scotA: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    scotB: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    scotC: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    scotD: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    scotE: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    scotF: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    scotG: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    scotH: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    scotI: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  { timestamps: false }
);

Curriculum.removeAttribute('id');
module.exports = Curriculum;
