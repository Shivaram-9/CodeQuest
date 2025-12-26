const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all problems (public)
router.get('/', problemController.getProblems);

// Get a single problem by ID (public)
router.get('/:id', problemController.getProblemById);

// Get problem statistics
router.get('/:id/stats', auth, problemController.getProblemStats);

// Create a new problem (admin only)
router.post('/', auth, adminAuth, problemController.createProblem);

// Update a problem (admin only)
router.put('/:id', auth, adminAuth, problemController.updateProblem);

// Delete a problem (admin only)
router.delete('/:id', auth, adminAuth, problemController.deleteProblem);

module.exports = router; 