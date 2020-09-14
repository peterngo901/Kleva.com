const Sequelize = require('sequelize');

const sequelize = require('../data/database');

const Student = sequelize.define('students', {
    studentID: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    firstName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = Student;