const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/advisorController');
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Base route: /api/advisor

// Protect all routes
router.use(auth, checkRole(['advisor']));

router.get('/students', advisorController.getAssignedStudents);
router.post('/remarks', advisorController.addRemark);
router.get('/appointments', advisorController.getAppointments);
router.put('/appointments/:id', advisorController.updateAppointmentStatus);
router.get('/student/:studentId/records', advisorController.getStudentRecords);

module.exports = router;
