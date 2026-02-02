const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const checkAuth = require('../middleware/checkAuth');

router.use(checkAuth);

// CRUD
router.get('/', studentController.getStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

// Exports
router.get('/export/excel', studentController.exportExcel);
router.get('/export/pdf', studentController.exportPDF);
router.get('/export/word', studentController.exportWord);

module.exports = router;
