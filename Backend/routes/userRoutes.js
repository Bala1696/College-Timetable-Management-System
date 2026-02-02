const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const checkAuth = require('../middleware/checkAuth');

// Protected route to list users (e.g., for Admin/HOD to see Faculty)
router.get('/', checkAuth, userController.getUsers);

module.exports = router;
