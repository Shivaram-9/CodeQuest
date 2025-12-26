const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Get leaderboard (public)
router.get('/leaderboard', userController.getLeaderboard);

// Get top streaks (public)
router.get('/streaks', userController.getTopStreaks);

// Get user profile by username (public)
router.get('/:username', userController.getUserProfile);

module.exports = router; 