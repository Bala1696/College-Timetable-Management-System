const Faculty = require('../models/Faculty');
const SupportingStaff = require('../models/SupportingStaff');
const Timetable = require('../models/Timetable');
const { Op } = require('sequelize');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const calculateFreeHours = (timetableEntries) => {
    const schedule = {};

    // Initialize empty schedule
    DAYS.forEach(day => {
        schedule[day] = [];
        PERIODS.forEach(period => {
            // We will mark it as 'Free' initially
            // But actually we want to list which periods are free.
        });
    });

    // Valid periods mapping
    const busySlots = {};
    // Format: "Monday-1": true

    timetableEntries.forEach(entry => {
        const start = entry.period_number;
        const end = entry.end_period || entry.period_number;

        for (let p = start; p <= end; p++) {
            busySlots[`${entry.day}-${p}`] = entry;
        }
    });

    const freeSlots = {};

    DAYS.forEach(day => {
        freeSlots[day] = [];
        PERIODS.forEach(period => {
            if (!busySlots[`${day}-${period}`]) {
                freeSlots[day].push(period);
            }
        });
    });

    return freeSlots;
};

exports.getFacultyWorkload = async (req, res) => {
    try {
        const facultyMembers = await Faculty.findAll();
        const timetable = await Timetable.findAll();

        const workloadData = facultyMembers.map(faculty => {
            // Filter timetable for this faculty
            const facultyEntries = timetable.filter(t => {
                let bookedFaculty = [];
                try {
                    bookedFaculty = Array.isArray(t.faculty_name) ? t.faculty_name
                        : (t.faculty_name.startsWith('[') ? JSON.parse(t.faculty_name) : [t.faculty_name]);
                } catch (e) {
                    bookedFaculty = [t.faculty_name];
                }
                // Handle mixed types just in case
                if (!Array.isArray(bookedFaculty)) bookedFaculty = [bookedFaculty];

                return bookedFaculty.includes(faculty.name);
            });

            const freeHours = calculateFreeHours(facultyEntries);

            // Get unique classes they teach for filtering
            const teachingClasses = [...new Set(facultyEntries.map(t => `${t.semester}-${t.section}`))];

            return {
                id: faculty.id,
                name: faculty.name,
                designation: faculty.designation,
                email: faculty.email,
                mobileNo: faculty.mobileNo,
                freeHours: freeHours,
                teachingClasses
            };
        });

        res.json(workloadData);
    } catch (error) {
        console.error('Error fetching faculty workload:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStaffWorkload = async (req, res) => {
    try {
        const staffMembers = await SupportingStaff.findAll();
        const timetable = await Timetable.findAll();

        const workloadData = staffMembers.map(staff => {
            const staffEntries = timetable.filter(t => {
                let bookedStaff = [];
                try {
                    bookedStaff = Array.isArray(t.faculty_name) ? t.faculty_name
                        : (t.faculty_name.startsWith('[') ? JSON.parse(t.faculty_name) : [t.faculty_name]);
                } catch (e) {
                    bookedStaff = [t.faculty_name];
                }
                if (!Array.isArray(bookedStaff)) bookedStaff = [bookedStaff];

                return bookedStaff.includes(staff.name);
            });

            const freeHours = calculateFreeHours(staffEntries);
            const teachingClasses = [...new Set(staffEntries.map(t => `${t.semester}-${t.section}`))];

            return {
                id: staff.id,
                name: staff.name,
                designation: staff.designation,
                email: staff.email,
                mobileNo: staff.mobileNo,
                freeHours: freeHours,
                teachingClasses
            };
        });

        res.json(workloadData);
    } catch (error) {
        console.error('Error fetching staff workload:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
