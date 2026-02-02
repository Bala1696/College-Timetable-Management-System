const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    serialNo: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    rollNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    studentName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    remarks: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    year: {
        type: DataTypes.ENUM('I', 'II', 'III', 'IV'),
        allowNull: false,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ['rollNumber', 'year']
        }
    ]
});

module.exports = Student;
