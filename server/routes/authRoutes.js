const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', authController.register);

// Login a user
router.post('/login', authController.login);

// Get current user profile
router.get('/me', auth, authController.getCurrentUser);

// Update user profile
router.put('/me', auth, authController.updateProfile);

// Change password
router.put('/password', auth, authController.changePassword);

module.exports = router; 