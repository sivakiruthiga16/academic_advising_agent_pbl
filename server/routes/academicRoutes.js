const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const academicController = require('../controllers/academicController');

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

module.exports = router;
