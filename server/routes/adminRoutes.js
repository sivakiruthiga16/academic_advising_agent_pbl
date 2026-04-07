import express from 'express';
const router = express.Router();
import * as adminController from '../controllers/adminController.js';
import auth from '../middleware/authMiddleware.js';
import checkRole from '../middleware/roleMiddleware.js';

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
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteUser);
router.put('/advisor/:id', adminController.updateAdvisor);
router.delete('/user/:id', adminController.deleteUser); // Keep for general user deletion if needed

export default router;
