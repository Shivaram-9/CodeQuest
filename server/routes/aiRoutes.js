const express = require('express');
const router = express.Router();
const { generateExplanation, generateQuiz } = require('../services/aiService');
const Problem = require('../models/Problem');

// Middleware to verify API key
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.GEMINI_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};

// Get AI explanation for a problem
router.post('/explain', verifyApiKey, async (req, res) => {
  try {
    const { problemId, conceptRequest } = req.body;
    
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    const explanation = await generateExplanation(problem, conceptRequest);
    res.json(explanation);
  } catch (error) {
    console.error('Error in AI explanation:', error);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

// Generate quiz for a problem
router.post('/quiz/generate', verifyApiKey, async (req, res) => {
  try {
    const { problemId } = req.body;
    
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    const quiz = await generateQuiz(problem);
    res.json(quiz);
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Enhanced AI code analysis
router.post('/enhanced-analyze', verifyApiKey, async (req, res) => {
  try {
    const { code, language, userSkillLevel, preferences } = req.body;
    // Placeholder: Implement actual enhanced analysis logic in aiService
    // const analysisResult = await aiService.enhancedAnalyze(code, language, userSkillLevel, preferences);
    
    // Mock response for now
    const analysisResult = {
      suggestions: [
        "Consider edge cases like empty inputs.",
        "Could this algorithm be optimized for time complexity?",
        "Ensure variable names are descriptive."
      ],
      performance: {
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        executionTimeMs: 50 // Example value
      }
    };

    res.json(analysisResult);
  } catch (error) {
    console.error('Error in enhanced AI analysis:', error);
    res.status(500).json({ error: 'Failed to perform enhanced analysis' });
  }
});

module.exports = router;