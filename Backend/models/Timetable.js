const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Timetable = sequelize.define('Timetable', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    semester: {
        type: DataTypes.ENUM('I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'),
        allowNull: false,
    },
    section: {
        type: DataTypes.ENUM('A', 'B'),
        allowNull: false,
    },
    day: {
        type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
        allowNull: false,
    },
    period_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Start period (1 to 8)',
    },
    end_period: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'End period for continuous sessions (e.g., lab)',
    },
    start_time: {
        type: DataTypes.STRING, // e.g., '09:00 AM'
        allowNull: false,
    },
    end_time: {
        type: DataTypes.STRING, // e.g., '10:00 AM'
        allowNull: false,
    },
    course_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subject_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    faculty_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    venue: {
        type: DataTypes.STRING,
        allowNull: false, // e.g., 'Room 101' or 'Lab 1'
    },
    type: {
        type: DataTypes.ENUM('Theory', 'Lab'),
        allowNull: false,
    },
    batch: {
        type: DataTypes.ENUM('Odd', 'Even', 'Both'),
        allowNull: false,
        defaultValue: 'Both',
    },
});

module.exports = Timetable;
