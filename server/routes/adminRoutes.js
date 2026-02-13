const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Base route: /api/admin

// Protect all routes
router.use(auth, checkRole(['admin']));

router.get('/students', adminController.getAllStudents);
router.get('/advisors', adminController.getAllAdvisors);
router.post('/assign-advisor', adminController.assignAdvisor);
router.post('/academic-records', adminController.addAcademicRecord);

// User Management Routes
router.post('/create-student', adminController.createStudent);
router.post('/create-advisor', adminController.createAdvisor);
router.put('/student/:id', adminController.updateStudent);
router.put('/advisor/:id', adminController.updateAdvisor);
router.delete('/user/:id', adminController.deleteUser);

module.exports = router;
