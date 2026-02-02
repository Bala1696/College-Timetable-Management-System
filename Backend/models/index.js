const sequelize = require('../config/database');
const User = require('./User');
const Timetable = require('./Timetable');
const Student = require('./Student');

// Define associations here if any
// Example: User.hasMany(Timetable);

const db = {
    sequelize,
    User,
    Timetable,
    Student,
};

module.exports = db;
