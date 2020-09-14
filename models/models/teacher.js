const Sequelize = require('sequelize');

const sequelize = require('../data/database');

const Teacher = sequelize.define('teacher', {
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    school: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    teacherID: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
    }
});

module.exports = Teacher;