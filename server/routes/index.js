const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const problemRoutes = require('./problemRoutes');
const submissionRoutes = require('./submissionRoutes');
const userRoutes = require('./userRoutes');
const aiRoutes = require('./aiRoutes');

// Mock data for development when database is not available
const mockProblems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    solvedCount: 120,
    successRate: 75
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    solvedCount: 95,
    successRate: 68
  },
  {
    id: 3,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    solvedCount: 87,
    successRate: 70
  },
  {
    id: 4,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    tags: ["Array", "Dynamic Programming"],
    solvedCount: 76,
    successRate: 65
  },
  {
    id: 5,
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    solvedCount: 68,
    successRate: 58
  }
];

// Mock user progress
const mockUserProgress = {
  completedProblems: [1, 3],
  attemptedProblems: [1, 2, 3, 5],
  starredProblems: [2, 4]
};

// Mock AI recommendations
const mockRecommendations = [
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    relevance: 95,
    reason: "Based on your previous solutions"
  },
  {
    id: 5,
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    relevance: 87,
    reason: "Helps improve your dynamic programming skills"
  },
  {
    id: 4,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    tags: ["Array", "Dynamic Programming"],
    relevance: 82,
    reason: "Similar to problems you've solved"
  }
];

// Debug endpoint to check if API is working
router.get('/debug', (req, res) => {
  res.json({
    status: 'API is working',
    timestamp: new Date().toISOString(),
    routes: [
      '/auth/*',
      '/problems/*',
      '/submissions/*',
      '/users/*',
      '/ai/*'
    ]
  });
});

// Mock endpoints that don't rely on the database
router.get('/problems/mock', (req, res) => {
  res.json(mockProblems);
});

router.get('/users/progress/mock', (req, res) => {
  res.json(mockUserProgress);
});

router.get('/ai/recommendations/mock', (req, res) => {
  res.json(mockRecommendations);
});

// API routes
router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is operational',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 errors for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

module.exports = router; 