const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const { checkRole } = require('../middleware/roleMiddleware');
const facultyController = require('../controllers/facultyController');
const staffController = require('../controllers/staffController');
const dashboardController = require('../controllers/dashboardController');
const validateRequest = require('../middleware/validateMiddleware');
const { facultySchemas, staffSchemas } = require('../utils/validationSchemas');

// Roles
const ALL_STAFF_ROLES = ['admin', 'faculty', 'supporting_staff'];
const ADMIN_ONLY = ['admin'];

const { handleUploadMiddleware } = require('../utils/fileHelper');

// Stats Route
router.get('/stats', checkAuth, checkRole(ALL_STAFF_ROLES), dashboardController.getDashboardStats);

// Faculty Routes
// View: all roles? Admin/Faculty/Staff can View Faculty list?
// RBAC Table: Faculty View -> Checked for all.
router.get('/faculty', checkAuth, checkRole(ALL_STAFF_ROLES), facultyController.getAllFaculty);
router.get('/faculty/:id', checkAuth, checkRole(ALL_STAFF_ROLES), facultyController.getFacultyById);

// Add: Admin, Faculty, Staff
router.post('/faculty', checkAuth, checkRole(ALL_STAFF_ROLES), handleUploadMiddleware, validateRequest(facultySchemas), facultyController.createFaculty);

// Edit: Admin, Faculty, Staff
router.put('/faculty/:id', checkAuth, checkRole(ALL_STAFF_ROLES), handleUploadMiddleware, validateRequest(facultySchemas), facultyController.updateFaculty);

// Delete: Admin ONLY
router.delete('/faculty/:id', checkAuth, checkRole(ADMIN_ONLY), facultyController.deleteFaculty);


// Staff Routes
// View: all roles
router.get('/staff', checkAuth, checkRole(ALL_STAFF_ROLES), staffController.getAllStaff);
router.get('/staff/:id', checkAuth, checkRole(ALL_STAFF_ROLES), staffController.getStaffById);

// Add: Admin, Faculty, Staff
router.post('/staff', checkAuth, checkRole(ALL_STAFF_ROLES), handleUploadMiddleware, validateRequest(staffSchemas), staffController.createStaff);

// Edit: Admin, Faculty, Staff
router.put('/staff/:id', checkAuth, checkRole(ALL_STAFF_ROLES), handleUploadMiddleware, validateRequest(staffSchemas), staffController.updateStaff);

// Delete: Admin ONLY
router.delete('/staff/:id', checkAuth, checkRole(ADMIN_ONLY), staffController.deleteStaff);

module.exports = router;
