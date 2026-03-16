import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js';
import auth from '../middleware/authMiddleware.js';

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.login);

// @route   POST api/auth/google
// @desc    Authenticate user via Google
// @access  Public
router.post('/google', authController.googleLogin);

// @route   POST api/auth/register
// @route   GET api/auth/advisors
// @desc    Get all advisors
// @access  Public (or Private)
router.get('/advisors', authController.getAdvisors);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, authController.getMe);

export default router;
