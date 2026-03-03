const express = require('express');
const router = express.Router();
const workloadController = require('../controllers/workloadController');
const checkAuth = require('../middleware/checkAuth');
const { checkRole } = require('../middleware/roleMiddleware');

router.get('/faculty', checkAuth, checkRole(['admin']), workloadController.getFacultyWorkload);
router.get('/staff', checkAuth, checkRole(['admin']), workloadController.getStaffWorkload);

module.exports = router;
