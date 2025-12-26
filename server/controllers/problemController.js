const Problem = require('../models/Problem');
const User = require('../models/User');
const Submission = require('../models/Submission');

// Get all problems with pagination and filtering
exports.getProblems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build the filter query
    const filter = {};
    
    // Filter by difficulty if provided
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }
    
    // Filter by tags if provided
    if (req.query.tags) {
      const tags = req.query.tags.split(',');
      filter.tags = { $in: tags };
    }
    
    // Search by title or description if search term provided
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Get problems with filters
    const problems = await Problem.find(filter)
      .select('title difficulty tags solvedCount totalSubmissions successRate')
      .sort(req.query.sort || '-createdAt')
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalProblems = await Problem.countDocuments(filter);
    
    // If user is authenticated, mark problems as solved or attempted
    if (req.user) {
      const user = await User.findById(req.user.id);
      
      problems.forEach(problem => {
        problem._doc.userStatus = 'unsolved';
        
        if (user.solvedProblems.includes(problem._id)) {
          problem._doc.userStatus = 'solved';
        } else if (user.attemptedProblems.includes(problem._id)) {
          problem._doc.userStatus = 'attempted';
        }
      });
    }
    
    return res.status(200).json({
      success: true,
      problems,
      pagination: {
        total: totalProblems,
        page,
        limit,
        pages: Math.ceil(totalProblems / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching problems',
      error: error.message
    });
  }
};

// Get a single problem by ID
exports.getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const problem = await Problem.findById(id)
      .populate('author', 'username')
      .populate('relatedProblems', 'title difficulty');
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Filter out hidden test cases for non-admin users
    const responseData = {
      ...problem._doc,
      testCases: problem.testCases
        .filter(testCase => !testCase.isHidden || req.user?.role === 'admin')
        .map(testCase => ({
          ...testCase._doc,
          input: testCase.input,
          expected: testCase.expected,
          isHidden: testCase.isHidden,
          explanation: testCase.explanation
        }))
    };
    
    // If user is authenticated, include user-specific information
    if (req.user) {
      const user = await User.findById(req.user.id);
      
      responseData.userStatus = 'unsolved';
      
      if (user.solvedProblems.includes(problem._id)) {
        responseData.userStatus = 'solved';
      } else if (user.attemptedProblems.includes(problem._id)) {
        responseData.userStatus = 'attempted';
      }
      
      // Get user's submissions for this problem
      const submissions = await Submission.find({
        user: req.user.id,
        problem: problem._id
      })
        .sort({ submittedAt: -1 })
        .limit(1)
        .select('status language code submittedAt');
      
      if (submissions.length > 0) {
        responseData.userSubmission = submissions[0];
      }
    }
    
    return res.status(200).json({
      success: true,
      problem: responseData
    });
  } catch (error) {
    console.error('Error fetching problem:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching problem',
      error: error.message
    });
  }
};

// Create a new problem (admin only)
exports.createProblem = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create problems'
      });
    }
    
    const {
      title,
      description,
      difficulty,
      constraints,
      inputFormat,
      outputFormat,
      sampleInput,
      sampleOutput,
      explanation,
      hints,
      testCases,
      tags,
      timeLimit,
      memoryLimit,
      starterCode,
      solutionCode
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and difficulty are required'
      });
    }
    
    // Check if a problem with the same title already exists
    const existingProblem = await Problem.findOne({ title });
    if (existingProblem) {
      return res.status(400).json({
        success: false,
        message: 'A problem with this title already exists'
      });
    }
    
    // Create the new problem
    const problem = new Problem({
      title,
      description,
      difficulty,
      constraints,
      inputFormat,
      outputFormat,
      sampleInput,
      sampleOutput,
      explanation,
      hints,
      testCases: testCases || [],
      tags: tags || [],
      timeLimit: timeLimit || 1000,
      memoryLimit: memoryLimit || 128,
      starterCode: starterCode || {},
      solutionCode: solutionCode || {},
      author: req.user.id
    });
    
    await problem.save();
    
    return res.status(201).json({
      success: true,
      problem
    });
  } catch (error) {
    console.error('Error creating problem:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating problem',
      error: error.message
    });
  }
};

// Update a problem (admin only)
exports.updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update problems'
      });
    }
    
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    const updateData = req.body;
    
    // Update problem with new data
    Object.keys(updateData).forEach(key => {
      problem[key] = updateData[key];
    });
    
    await problem.save();
    
    return res.status(200).json({
      success: true,
      problem
    });
  } catch (error) {
    console.error('Error updating problem:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating problem',
      error: error.message
    });
  }
};

// Delete a problem (admin only)
exports.deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete problems'
      });
    }
    
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Check if there are submissions for this problem
    const submissions = await Submission.countDocuments({ problem: id });
    if (submissions > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete problem with existing submissions',
        submissionCount: submissions
      });
    }
    
    await problem.remove();
    
    return res.status(200).json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting problem:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting problem',
      error: error.message
    });
  }
};

// Get problem statistics
exports.getProblemStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Get submission statistics
    const stats = await Submission.aggregate([
      { $match: { problem: mongoose.Types.ObjectId(id) } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgExecutionTime: { $avg: '$executionTime' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Get language distribution
    const languageStats = await Submission.aggregate([
      { $match: { problem: mongoose.Types.ObjectId(id) } },
      { $group: {
        _id: '$language',
        count: { $sum: 1 },
        acceptedCount: { 
          $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] } 
        }
      }},
      { $sort: { count: -1 } }
    ]);
    
    return res.status(200).json({
      success: true,
      stats: {
        totalSubmissions: problem.totalSubmissions,
        solvedCount: problem.solvedCount,
        successRate: problem.successRate,
        statusDistribution: stats,
        languageDistribution: languageStats.map(item => ({
          language: item._id,
          count: item.count,
          acceptedCount: item.acceptedCount,
          acceptanceRate: item.count > 0 ? (item.acceptedCount / item.count) * 100 : 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching problem stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching problem statistics',
      error: error.message
    });
  }
}; 