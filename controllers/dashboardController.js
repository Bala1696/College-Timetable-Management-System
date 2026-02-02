const Faculty = require('../models/Faculty');
const SupportingStaff = require('../models/SupportingStaff');
const Timetable = require('../models/Timetable');
const sequelize = require('../config/database');

exports.getDashboardStats = async (req, res) => {
    try {
        const facultyCount = await Faculty.count();
        const staffCount = await SupportingStaff.count();
        const periodsCount = await Timetable.count();

        // Count distinct courses
        // Sequelize distinct count might be tricky depending on DB, but standard way:
        const coursesCount = await Timetable.count({
            distinct: true,
            col: 'course_code'
        });

        res.json({
            faculty: facultyCount,
            staff: staffCount,
            periods: periodsCount,
            courses: coursesCount
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};
