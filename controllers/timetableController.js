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
        const { semester, section, day, period_number, end_period, start_time, end_time, course_code, subject_name, venue, type, batch } = req.body;
        let { faculty_name } = req.body;

        // Ensure faculty_name is stored as a JSON string if it's an array
        if (Array.isArray(faculty_name)) {
            faculty_name = JSON.stringify(faculty_name);
        }

        const effectiveEnd = end_period || period_number;

        // 1. Room Conflict Check
        const roomConflict = await Timetable.findOne({
            where: {
                day,
                venue,
                [Op.or]: [
                    { period_number: { [Op.between]: [period_number, effectiveEnd] } },
                    { end_period: { [Op.between]: [period_number, effectiveEnd] } },
                    {
                        [Op.and]: [
                            { period_number: { [Op.lte]: period_number } },
                            { end_period: { [Op.gte]: effectiveEnd } }
                        ]
                    }
                ]
            }
        });

        if (roomConflict) {
            return res.status(400).json({
                message: `Room Conflict: ${venue} is already occupied by ${roomConflict.course_code} (${roomConflict.semester}-${roomConflict.section}) during these periods.`
            });
        }

        // 2. Student Class Conflict Check (Same Semester & Section cannot be in two places)
        const classConflict = await Timetable.findOne({
            where: {
                day,
                semester,
                section,
                [Op.or]: [
                    { period_number: { [Op.between]: [period_number, effectiveEnd] } },
                    { end_period: { [Op.between]: [period_number, effectiveEnd] } },
                    {
                        [Op.and]: [
                            { period_number: { [Op.lte]: period_number } },
                            { end_period: { [Op.gte]: effectiveEnd } }
                        ]
                    }
                ]
            }
        });

        if (classConflict) {
            return res.status(400).json({
                message: `Class Conflict: Semester ${semester}-${section} is already scheduled for ${classConflict.subject_name} in ${classConflict.venue}.`
            });
        }

        // 3. Faculty Conflict Check
        // We need to fetch all classes at this time and check if any of the selected faculty are already booked.
        // 3. Faculty Conflict Check
        let currentFacultyList = [];
        if (Array.isArray(faculty_name)) {
            currentFacultyList = faculty_name;
        } else {
            try {
                const parsed = JSON.parse(faculty_name);
                currentFacultyList = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                currentFacultyList = [faculty_name];
            }
        }

        const concurrentClasses = await Timetable.findAll({
            where: {
                day,
                [Op.or]: [
                    { period_number: { [Op.between]: [period_number, effectiveEnd] } },
                    { end_period: { [Op.between]: [period_number, effectiveEnd] } },
                    {
                        [Op.and]: [
                            { period_number: { [Op.lte]: period_number } },
                            { end_period: { [Op.gte]: effectiveEnd } }
                        ]
                    }
                ]
            }
        });

        for (const cls of concurrentClasses) {
            let bookedFaculty = [];
            try {
                // Handle both old string format and new JSON format
                bookedFaculty = cls.faculty_name.startsWith('[') ? JSON.parse(cls.faculty_name) : [cls.faculty_name];
            } catch (e) {
                bookedFaculty = [cls.faculty_name];
            }

            // Check intersection
            const busyFaculty = currentFacultyList.filter(f => bookedFaculty.includes(f));
            if (busyFaculty.length > 0) {
                return res.status(400).json({
                    message: `Faculty Conflict: ${busyFaculty.join(', ')} is/are already teaching in ${cls.venue} with ${cls.semester}-${cls.section}.`
                });
            }
        }

        const entry = await Timetable.create({
            semester, section, day, period_number, end_period: effectiveEnd, start_time, end_time, course_code, subject_name, faculty_name: JSON.stringify(currentFacultyList), venue, type, batch
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
        const { semester, section, day, period_number, end_period, start_time, end_time, course_code, subject_name, venue, type, batch } = req.body;
        let { faculty_name } = req.body;



        let currentFacultyList = [];
        if (Array.isArray(faculty_name)) {
            currentFacultyList = faculty_name;
        } else {
            try {
                const parsed = JSON.parse(faculty_name);
                currentFacultyList = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                currentFacultyList = [faculty_name];
            }
        }
        // Ensure strictly JSON string for internal logic and saving
        faculty_name = JSON.stringify(currentFacultyList);

        const effectiveEnd = end_period || period_number;

        // 1. Room Conflict Check (Excluding self)
        const roomConflict = await Timetable.findOne({
            where: {
                id: { [Op.ne]: id },
                day,
                venue,
                [Op.or]: [
                    { period_number: { [Op.between]: [period_number, effectiveEnd] } },
                    { end_period: { [Op.between]: [period_number, effectiveEnd] } },
                    {
                        [Op.and]: [
                            { period_number: { [Op.lte]: period_number } },
                            { end_period: { [Op.gte]: effectiveEnd } }
                        ]
                    }
                ]
            }
        });

        if (roomConflict) {
            return res.status(400).json({
                message: `Room Conflict: ${venue} is already occupied by ${roomConflict.course_code} (${roomConflict.semester}-${roomConflict.section}) during these periods.`
            });
        }

        // 2. Student Class Conflict Check
        const classConflict = await Timetable.findOne({
            where: {
                id: { [Op.ne]: id },
                day,
                semester,
                section,
                [Op.or]: [
                    { period_number: { [Op.between]: [period_number, effectiveEnd] } },
                    { end_period: { [Op.between]: [period_number, effectiveEnd] } },
                    {
                        [Op.and]: [
                            { period_number: { [Op.lte]: period_number } },
                            { end_period: { [Op.gte]: effectiveEnd } }
                        ]
                    }
                ]
            }
        });

        if (classConflict) {
            return res.status(400).json({
                message: `Class Conflict: Semester ${semester}-${section} is already scheduled for ${classConflict.subject_name} in ${classConflict.venue}.`
            });
        }

        // 3. Faculty Conflict Check
        // currentFacultyList (Array) is already computed at the start of the function

        const concurrentClasses = await Timetable.findAll({
            where: {
                id: { [Op.ne]: id },
                day,
                [Op.or]: [
                    { period_number: { [Op.between]: [period_number, effectiveEnd] } },
                    { end_period: { [Op.between]: [period_number, effectiveEnd] } },
                    {
                        [Op.and]: [
                            { period_number: { [Op.lte]: period_number } },
                            { end_period: { [Op.gte]: effectiveEnd } }
                        ]
                    }
                ]
            }
        });

        for (const cls of concurrentClasses) {
            let bookedFaculty = [];
            try {
                bookedFaculty = cls.faculty_name.startsWith('[') ? JSON.parse(cls.faculty_name) : [cls.faculty_name];
            } catch (e) {
                bookedFaculty = [cls.faculty_name];
            }

            const busyFaculty = currentFacultyList.filter(f => bookedFaculty.includes(f));
            if (busyFaculty.length > 0) {
                return res.status(400).json({
                    message: `Faculty Conflict: ${busyFaculty.join(', ')} is/are already teaching in ${cls.venue} with ${cls.semester}-${cls.section}.`
                });
            }
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
