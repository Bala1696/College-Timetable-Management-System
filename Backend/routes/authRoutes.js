const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validateRequest = require('../middleware/validateMiddleware');
const { authSchemas } = require('../utils/validationSchemas');

const checkAuth = require('../middleware/checkAuth');

router.post('/register', validateRequest(authSchemas.register), authController.register);
router.post('/login', validateRequest(authSchemas.login), authController.login);
router.post('/logout', authController.logout);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', validateRequest(authSchemas.forgotPassword), authController.forgotPassword);
router.post('/reset-password/:token', validateRequest(authSchemas.resetPassword), authController.resetPassword);
router.post('/change-password', checkAuth, validateRequest(authSchemas.changePassword), authController.changePassword);
router.post('/join-invitation', validateRequest(authSchemas.joinInvitation), authController.joinByInvitation);

module.exports = router;
