const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const auth = require('../middleware/auth');
const { executeCode } = require('../utils/codeExecutor');
const Problem = require('../models/Problem');
const User = require('../models/User');
const CodeExecutor = require('../utils/codeExecutor');
const CodeAnalyzer = require('../utils/codeAnalyzer');

// Submit a solution
router.post('/', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.body.challengeId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        const submission = new Submission({
            user: req.user.id,
            challenge: challenge._id,
            code: req.body.code,
            language: req.body.language
        });

        // Execute code against test cases
        const results = await executeCode({
            code: req.body.code,
            language: req.body.language,
            testCases: challenge.testCases,
            timeLimit: challenge.timeLimit,
            memoryLimit: challenge.memoryLimit
        });

        submission.testCaseResults = results.testCaseResults;
        submission.status = results.status;
        submission.executionTime = results.executionTime;
        submission.memoryUsed = results.memoryUsed;

        // Calculate score based on test case results and challenge points
        if (results.status === 'accepted') {
            submission.score = challenge.points;
        }

        await submission.save();
        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's submissions for a challenge
router.get('/challenge/:challengeId', auth, async (req, res) => {
    try {
        const submissions = await Submission.find({
            user: req.user.id,
            challenge: req.params.challengeId
        })
        .sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's submission history
router.get('/history', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const submissions = await Submission.find({ user: req.user.id })
            .populate('challenge', 'title difficulty points')
            .sort({ submittedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Submission.countDocuments({ user: req.user.id });

        res.json({
            submissions,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get submission details
router.get('/:id', auth, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('challenge', 'title difficulty points');

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Check if the submission belongs to the requesting user
        if (submission.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get recent submissions (admin only)
router.get('/admin/recent', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const submissions = await Submission.find()
            .populate('user', 'username')
            .populate('challenge', 'title')
            .sort({ submittedAt: -1 })
            .limit(50);

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Run code without saving (execute against test cases)
router.post('/run', auth, async (req, res) => {
    try {
        const { code, language, problemId, isFullProgram } = req.body;
        
        if (!code || !language || !problemId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Get the problem
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        
        // Get visible test cases (non-hidden)
        const testCases = problem.testCases.filter(tc => !tc.isHidden);
        
        // Execute code against each test case
        const testResults = await CodeExecutor.executeTestCases(code, language, testCases, null, isFullProgram);
        
        // Calculate success rate
        const passedTests = testResults.filter(result => result.passed).length;
        const successRate = (passedTests / testResults.length) * 100;
        
        res.json({
            output: `Executed ${testResults.length} test cases. ${passedTests} passed (${successRate.toFixed(2)}%).`,
            testResults
        });
    } catch (error) {
        console.error('Error running code:', error);
        res.status(500).json({ 
            message: 'Error executing code', 
            error: error.message 
        });
    }
});

// Submit solution
router.post('/submit', auth, async (req, res) => {
    try {
        const { code, language, problemId, isFullProgram } = req.body;
        
        if (!code || !language || !problemId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Get the problem
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        
        // Execute code against all test cases, including hidden ones
        const testResults = await CodeExecutor.executeTestCases(code, language, problem.testCases, null, isFullProgram);
        
        // Calculate whether all tests passed
        const allPassed = testResults.every(result => result.passed);
        const status = allPassed ? 'accepted' : 'rejected';
        
        // Create submission record
        const submission = new Submission({
            user: req.user.id,
            problem: problemId,
            code,
            language,
            isFullProgram: !!isFullProgram,
            status,
            testResults,
            executionTime: Math.max(...testResults.map(result => result.executionTime || 0)),
            memoryUsed: Math.max(...testResults.map(result => result.memoryUsed || 0))
        });
        
        await submission.save();
        
        // If solution is accepted and user hasn't solved this problem before
        if (status === 'accepted') {
            const user = await User.findById(req.user.id);
            
            if (!user.completedProblems.includes(problemId)) {
                // Add to completed problems
                user.completedProblems.push(problemId);
                
                // Award points based on difficulty
                const difficultyPoints = {
                    'easy': 10,
                    'medium': 20,
                    'hard': 30
                };
                
                user.totalPoints += difficultyPoints[problem.difficulty.toLowerCase()] || 10;
                
                // Update user level based on points
                user.level = Math.floor(user.totalPoints / 100) + 1;
                
                // Increment problem solved count
                if (!problem.solvedCount) problem.solvedCount = 0;
                problem.solvedCount += 1;
                
                // Update success rate
                const totalSubmissions = await Submission.countDocuments({ problem: problemId });
                const successfulSubmissions = await Submission.countDocuments({ 
                    problem: problemId, 
                    status: 'accepted' 
                });
                
                problem.successRate = ((successfulSubmissions / totalSubmissions) * 100).toFixed(0) + '%';
                
                await user.save();
                await problem.save();
            }
        }
        
        // Analyze code for performance (non-blocking, doesn't need to wait)
        CodeAnalyzer.analyzeCode(code, language, problem)
            .then(analysis => {
                // Update submission with analysis
                submission.analysis = analysis;
                submission.save();
            })
            .catch(err => console.error('Error analyzing code:', err));
        
        res.json({
            status,
            submissionId: submission._id,
            testResults
        });
    } catch (error) {
        console.error('Error submitting code:', error);
        res.status(500).json({ 
            message: 'Error submitting code', 
            error: error.message 
        });
    }
});

// Get user's submissions
router.get('/user', auth, async (req, res) => {
    try {
        const submissions = await Submission.find({ user: req.user.id })
            .populate('problem', 'title difficulty')
            .sort({ createdAt: -1 });
        
        res.json(submissions);
    } catch (error) {
        console.error('Error getting submissions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get specific submission
router.get('/:id', auth, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('problem', 'title difficulty description examples constraints');
        
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        
        // Check if user is authorized to view this submission
        if (submission.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        res.json(submission);
    } catch (error) {
        console.error('Error getting submission:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;