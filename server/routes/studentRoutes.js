const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Base route: /api/student

// Protect all routes
router.use(auth, checkRole(['student']));

router.get('/profile', studentController.getProfile);
router.get('/records', studentController.getAcademicRecords);
router.get('/remarks', studentController.getRemarks);
router.post('/appointments', studentController.bookAppointment);
router.get('/appointments', studentController.getMyAppointments);

module.exports = router;
