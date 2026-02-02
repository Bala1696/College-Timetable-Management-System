const express = require('express');
const router = express.Router();
const timetableExportController = require('../controllers/timetableExportController');
const checkAuth = require('../middleware/checkAuth');

// Export Routes
// Assuming any authenticated user can export for now, or maybe just Faculty/Admin/Staff
router.get('/pdf', timetableExportController.exportToPDF);
router.get('/word', timetableExportController.exportToWord);

module.exports = router;
