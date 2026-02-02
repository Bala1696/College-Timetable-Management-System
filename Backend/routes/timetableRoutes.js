const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const validateRequest = require('../middleware/validateMiddleware');
const { timetableSchemas } = require('../utils/validationSchemas');
const checkAuth = require('../middleware/checkAuth');
const { checkRole } = require('../middleware/roleMiddleware');

// Public read access (or protected depending on requirements, making it public for now or student accessible)
router.get('/', timetableController.getTimetable);

// Protected write access (Admin/Faculty/Supporting Staff)
router.post('/', checkAuth, checkRole(['admin', 'faculty', 'supporting_staff']), validateRequest(timetableSchemas), timetableController.createTimetableEntry);
router.put('/:id', checkAuth, checkRole(['admin', 'faculty', 'supporting_staff']), validateRequest(timetableSchemas), timetableController.updateTimetableEntry);
router.delete('/:id', checkAuth, checkRole(['admin', 'faculty', 'supporting_staff']), timetableController.deleteTimetableEntry);

module.exports = router;
