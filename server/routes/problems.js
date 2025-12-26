const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Problem = require('../models/Problem');

// Get all problems
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find({})
      .select('id title difficulty tags solvedCount successRate timeLimit memoryLimit');
    
    res.json(problems);
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get problem by ID
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    res.json(problem);
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get problem test cases (protected route)
router.get('/:id/testcases', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Only return non-hidden test cases for regular users
    // Only admins can see hidden test cases
    const testCases = req.user.role === 'admin' 
      ? problem.testCases 
      : problem.testCases.filter(tc => !tc.isHidden);
    
    res.json(testCases);
  } catch (error) {
    console.error('Error fetching test cases:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get related problems
router.get('/:id/related', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // If problem has relatedProblems field, fetch those problems
    if (problem.relatedProblems && problem.relatedProblems.length > 0) {
      const relatedProblems = await Problem.find({
        _id: { $in: problem.relatedProblems }
      }).select('id title difficulty tags');
      
      return res.json(relatedProblems);
    }
    
    // Otherwise, find problems with similar tags
    const similarProblems = await Problem.find({
      _id: { $ne: problem._id },
      tags: { $in: problem.tags }
    })
    .limit(3)
    .select('id title difficulty tags');
    
    res.json(similarProblems);
  } catch (error) {
    console.error('Error fetching related problems:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route to create a new problem
router.post('/', auth, async (req, res) => {
  // Verify admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  try {
    const newProblem = new Problem(req.body);
    await newProblem.save();
    
    res.status(201).json(newProblem);
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route to update a problem
router.put('/:id', auth, async (req, res) => {
  // Verify admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    res.json(problem);
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 