import express from 'express';
const router = express.Router();
import auth from '../middleware/authMiddleware.js';
import role from '../middleware/roleMiddleware.js';
import * as academicController from '../controllers/academicController.js';

// @route   POST api/academic/remark
// @access  Private (Advisor/Admin)
router.post('/remark', auth, role(['advisor', 'admin']), academicController.addRemark);

// @route   GET api/academic/suggestions/:studentId
// @access  Private (Student/Advisor/Admin)
router.get('/suggestions/:studentId', auth, academicController.getSuggestions);

// @route   GET api/academic/remarks/:studentId
// @access  Private
router.get('/remarks/:studentId', auth, academicController.getRemarks);

// @route   POST api/academic/records
// @access  Private (Admin)
router.post('/records', auth, role(['admin']), academicController.upsertRecord);

// @route   GET api/academic/records/:studentId
// @access  Private
router.get('/records/:studentId', auth, academicController.getRecords);

// @route   DELETE api/academic/records/:id
// @access  Private (Admin)
router.delete('/records/:id', auth, role(['admin']), academicController.deleteRecord);

// @route   DELETE api/academic/remark/:id
// @access  Private (Advisor/Admin)
router.delete('/remark/:id', auth, role(['advisor', 'admin']), academicController.deleteRemark);

export default router;
