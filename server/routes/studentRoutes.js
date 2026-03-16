import express from 'express';
const router = express.Router();
import * as studentController from '../controllers/studentController.js';
import auth from '../middleware/authMiddleware.js';
import checkRole from '../middleware/roleMiddleware.js';

// Base route: /api/student

// Protect all routes
router.use(auth, checkRole(['student']));

router.get('/profile', studentController.getProfile);
router.get('/records', studentController.getAcademicRecords);
router.get('/remarks', studentController.getRemarks);
router.post('/appointments', studentController.bookAppointment);
router.get('/appointments', studentController.getMyAppointments);

export default router;
