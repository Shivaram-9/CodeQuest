const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to CodeQuest API',
    endpoints: [
      '/api/auth/login',
      '/api/problems',
      '/health'
    ]
  });
});

// Demo auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Check for demo credentials
  if (email === '1234' && password === '1234') {
    // Create demo user
    const demoUser = {
      id: 'demo-user-id',
      username: 'CodeMaster',
      email: '1234',
      name: 'Demo User',
      role: 'user',
      totalPoints: 1250,
      rank: 42,
      level: 'Intermediate'
    };
    
    // Generate token
    const token = jwt.sign(
      { id: demoUser.id, username: demoUser.username, role: demoUser.role },
      process.env.JWT_SECRET || 'codequestdemo12345secret',
      { expiresIn: '24h' }
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      token,
      user: demoUser
    });
  }
  
  // If not demo credentials, return error
  return res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  });
});

// Simplified problems endpoint
app.get('/api/problems', (req, res) => {
  const problems = [
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
    }
  ];
  
  res.json(problems);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: err.message
  });
});

module.exports = app; 