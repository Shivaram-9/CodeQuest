const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const RecommendationEngine = require('../utils/recommendationEngine');
const CodeAnalyzer = require('../utils/codeAnalyzer');
const VisualizationEngine = require('../utils/visualizationEngine');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const User = require('../models/User');
const ProblemGenerator = require('../utils/problemGenerator');

// Get personalized challenge recommendations
router.get('/recommendations', auth, async (req, res) => {
    try {
        // Get user's solved problems and past submissions
        const user = await User.findById(req.user.id);
        const userSubmissions = await Submission.find({ user: req.user.id });
        
        // Pass to recommendation engine
        const recommendations = await RecommendationEngine.getRecommendedChallenges(
            user,
            userSubmissions
        );
        
        res.json(recommendations);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get personalized learning path
router.get('/learning-path', auth, async (req, res) => {
    try {
        // Get user's progress data
        const user = await User.findById(req.user.id);
        
        // Get personalized learning path
        const learningPath = await RecommendationEngine.getPersonalizedLearningPath(user);
        
        res.json(learningPath);
    } catch (error) {
        console.error('Error getting learning path:', error);
        res.status(500).json({ message: error.message });
    }
});

// Analyze code submission
router.post('/analyze', auth, async (req, res) => {
    try {
        const { code, language, problemId } = req.body;
        
        if (!code || !language || !problemId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Get the problem
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        
        // Analyze the code
        const analysis = await CodeAnalyzer.analyzeCode(code, language, problem);
        
        res.json(analysis);
    } catch (error) {
        console.error('Error analyzing code:', error);
        res.status(500).json({ message: error.message });
    }
});

// Generate code visualization
router.post('/visualize', auth, async (req, res) => {
    try {
        const { code, language, problemId } = req.body;
        
        if (!code || !language || !problemId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Get the problem
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        
        // Generate visualization
        const visualization = await VisualizationEngine.generateVisualization(
            code,
            language,
            problem
        );
        
        res.json(visualization);
    } catch (error) {
        console.error('Error generating visualization:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get AI explanation for a concept
router.post('/explain', auth, async (req, res) => {
    try {
        const { problemId, conceptRequest } = req.body;
        
        if (!problemId || !conceptRequest) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Get the problem
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        
        // Generate explanation based on the problem and the concept requested
        const explanation = await RecommendationEngine.generateConceptExplanation(
            problem,
            conceptRequest
        );
        
        res.json(explanation);
    } catch (error) {
        console.error('Error generating explanation:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get real-time code suggestions
router.post('/suggestions', auth, async (req, res) => {
    try {
        const { code, language, problemId } = req.body;
        
        if (!code || !language || !problemId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Get the problem
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        
        // Generate suggestions
        const suggestion = await CodeAnalyzer.generateSuggestion(code, language, problem);
        
        res.json({ suggestion });
    } catch (error) {
        console.error('Error generating suggestions:', error);
        res.status(500).json({ message: error.message });
    }
});

// Generate a new coding problem dynamically
router.post('/generate-problem', auth, async (req, res) => {
    try {
        const { topic, difficulty, complexity } = req.body;
        
        if (!topic || !difficulty) {
            return res.status(400).json({ message: 'Topic and difficulty are required fields' });
        }
        
        // Generate the problem
        const generatedProblem = await ProblemGenerator.generateProblem({
            topic,
            difficulty,
            complexity: complexity || 'moderate',
            includeTestCases: true
        });
        
        // Optional: Save to database if needed
        if (req.body.save) {
            const newProblem = new Problem({
                ...generatedProblem,
                author: req.user.id
            });
            
            await newProblem.save();
            return res.status(201).json({ 
                message: 'Problem generated and saved', 
                problem: newProblem 
            });
        }
        
        res.json({ 
            message: 'Problem generated successfully', 
            problem: generatedProblem 
        });
    } catch (error) {
        console.error('Error generating problem:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;