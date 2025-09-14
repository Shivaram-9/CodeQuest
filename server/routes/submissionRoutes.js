const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const auth = require('../middleware/auth');

// Create a new submission
router.post('/', auth, submissionController.createSubmission);

// Get a submission by ID
router.get('/:id', auth, submissionController.getSubmission);

// Get all submissions for the current user
router.get('/user/me', auth, submissionController.getUserSubmissions);

// Get all submissions for a specific user (admin only)
router.get('/user/:userId', auth, submissionController.getUserSubmissions);

// Get all submissions for a problem (admin only)
router.get('/problem/:problemId', auth, submissionController.getProblemSubmissions);

// Route for running tests against code
router.post('/test', auth, submissionController.runTests); // Assuming runTests exists in controller

module.exports = router;