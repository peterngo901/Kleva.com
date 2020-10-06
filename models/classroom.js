const Sequelize = require('sequelize');

const sequelize = require('../data/database');

// New Model define()

const Classroom = sequelize.define('classroom', {
    classCode: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    yearLevel: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    subject: {
        type: Sequelize.STRING,
        allowNull: false
    },
    teacherID: {
        type: Sequelize.STRING,
        allowNull: false
    },
    games: {
        type: Sequelize.STRING(50000),
    }
});

module.exports = Classroom;