const Timetable = require('../models/Timetable');
const { Op } = require('sequelize');

// Permission Helper
const canManageTimetable = (user) => {
    return ['admin', 'hod', 'faculty', 'supporting_staff'].includes(user.role);
};

exports.createTimetableEntry = async (req, res) => {
    try {
        if (!canManageTimetable(req.user)) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const { semester, section, day, period_number, end_period, start_time, end_time, course_code, subject_name, faculty_name, venue, type, batch } = req.body;

        const effectiveEnd = end_period || period_number;

        // Check for conflicts (Same venue, same day, overlapping periods)
        const conflict = await Timetable.findOne({
            where: {
                day,
                venue,
                [Op.or]: [
                    {
                        period_number: { [Op.between]: [period_number, effectiveEnd] }
                    },
                    {
                        end_period: { [Op.between]: [period_number, effectiveEnd] }
                    },
                    {
                        [Op.and]: [
                            { period_number: { [Op.lte]: period_number } },
                            { end_period: { [Op.gte]: effectiveEnd } }
                        ]
                    }
                ]
            }
        });

        if (conflict) {
            return res.status(400).json({
                message: `Conflict: ${venue} is already occupied by ${conflict.course_code} during these periods.`
            });
        }

        const entry = await Timetable.create({
            semester, section, day, period_number, end_period: effectiveEnd, start_time, end_time, course_code, subject_name, faculty_name, venue, type, batch
        });
        res.status(201).json(entry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getTimetable = async (req, res) => {
    try {
        const { semester, section, day, faculty_name } = req.query;
        const whereClause = {};

        if (semester) whereClause.semester = semester;
        if (section) whereClause.section = section;
        if (day) whereClause.day = day;
        if (faculty_name) whereClause.faculty_name = { [Op.like]: `%${faculty_name}%` };

        const entries = await Timetable.findAll({ where: whereClause });
        res.json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateTimetableEntry = async (req, res) => {
    try {
        if (!canManageTimetable(req.user)) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const { id } = req.params;
        const { semester, section, day, period_number, end_period, start_time, end_time, course_code, subject_name, faculty_name, venue, type, batch } = req.body;

        const effectiveEnd = end_period || period_number;

        // Check for conflicts excluding this entry
        const conflict = await Timetable.findOne({
            where: {
                id: { [Op.ne]: id },
                day,
                venue,
                [Op.or]: [
                    {
                        period_number: { [Op.between]: [period_number, effectiveEnd] }
                    },
                    {
                        end_period: { [Op.between]: [period_number, effectiveEnd] }
                    },
                    {
                        [Op.and]: [
                            { period_number: { [Op.lte]: period_number } },
                            { end_period: { [Op.gte]: effectiveEnd } }
                        ]
                    }
                ]
            }
        });

        if (conflict) {
            return res.status(400).json({
                message: `Conflict: ${venue} is already occupied by ${conflict.course_code} during these periods.`
            });
        }

        const [updated] = await Timetable.update({
            semester, section, day, period_number, end_period: effectiveEnd, start_time, end_time, course_code, subject_name, faculty_name, venue, type, batch
        }, { where: { id } });

        if (updated) {
            const updatedEntry = await Timetable.findByPk(id);
            res.json(updatedEntry);
        } else {
            res.status(404).json({ message: 'Entry not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteTimetableEntry = async (req, res) => {
    try {
        if (!canManageTimetable(req.user)) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const { id } = req.params;
        const deleted = await Timetable.destroy({ where: { id } });
        if (deleted) {
            res.json({ message: 'Entry deleted' });
        } else {
            res.status(404).json({ message: 'Entry not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
