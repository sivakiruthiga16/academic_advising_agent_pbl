const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

// @route   GET api/appointments
// @desc    Get all appointments (Role specific)
// @access  Private
router.get('/', auth, appointmentController.getAppointments);

// @route   POST api/appointments
// @desc    Book appointment
// @access  Private (Student)
router.post('/', auth, appointmentController.bookAppointment);

// @route   PUT api/appointments/:id
// @desc    Update status
// @access  Private (Advisor)
router.put('/:id', auth, appointmentController.updateAppointmentStatus);
router.delete('/:id', auth, appointmentController.deleteAppointment);

router.get('/notifications', auth, appointmentController.getNotificationCounts);
router.get('/notifications/advisor/:advisorId', auth, appointmentController.getNotificationCounts);
router.get('/notifications/student/:studentId', auth, appointmentController.getNotificationCounts);
router.put('/notifications/mark-viewed', auth, appointmentController.markNotificationsViewed);

module.exports = router;
