import express from 'express';
const router = express.Router();
import * as advisorController from '../controllers/advisorController.js';
import auth from '../middleware/authMiddleware.js';
import checkRole from '../middleware/roleMiddleware.js';

// Base route: /api/advisor

// Protect all routes
router.use(auth, checkRole(['advisor']));

router.get('/students', advisorController.getAssignedStudents);
router.post('/remarks', advisorController.addRemark);
router.get('/appointments', advisorController.getAppointments);
router.put('/appointments/:id', advisorController.updateAppointmentStatus);
router.get('/student/:id', advisorController.getStudentById);
router.get('/student/:studentId/records', advisorController.getStudentRecords);

export default router;
