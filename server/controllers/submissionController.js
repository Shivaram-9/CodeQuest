const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const CodeExecutor = require('../utils/codeExecutor');
const mongoose = require('mongoose');

// Create a new submission and execute the code against test cases
exports.createSubmission = async (req, res) => {
  try {
    const { problemId, code, language, isFullProgram } = req.body;
    const userId = req.user.id;

    if (!code || !language || !problemId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code, language, and problem ID are required' 
      });
    }

    // Check if supported language
    const supportedLanguages = ['javascript', 'python', 'java', 'cpp'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({ 
        success: false, 
        message: `Unsupported language: ${language}. Supported languages: ${supportedLanguages.join(', ')}` 
      });
    }

    // Find the problem to get test cases
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Problem not found' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Create a new submission with initial status
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      isFullProgram: !!isFullProgram,
      status: 'Processing',
      submittedAt: new Date()
    });

    await submission.save();

    // Execute code against test cases
    const codeExecutor = new CodeExecutor();
    const testResults = [];
    let totalExecutionTime = 0;
    let allTestsPassed = true;
    
    for (const testCase of problem.testCases) {
      try {
        // Set time limit from problem or use default
        const timeLimit = problem.timeLimit || 1000; // milliseconds
        
        const start = Date.now();
        const result = await codeExecutor.executeTestCase(
          code, 
          language, 
          testCase.input, 
          testCase.expected, 
          timeLimit,
          !!isFullProgram
        );
        const executionTime = Date.now() - start;
        
        totalExecutionTime += executionTime;
        
        const testResult = {
          testCaseId: testCase._id,
          passed: result.passed,
          output: result.output,
          expectedOutput: testCase.expected,
          executionTime,
          error: result.error || null
        };
        
        testResults.push(testResult);
        
        if (!result.passed) {
          allTestsPassed = false;
        }
      } catch (error) {
        testResults.push({
          testCaseId: testCase._id,
          passed: false,
          output: null,
          expectedOutput: testCase.expected,
          executionTime: 0,
          error: error.message
        });
        allTestsPassed = false;
      }
    }

    // Update submission with results
    submission.testResults = testResults;
    submission.executionTime = totalExecutionTime;
    
    if (allTestsPassed) {
      submission.status = 'Accepted';
      
      // Check if user has already solved this problem
      if (!user.solvedProblems.includes(problemId)) {
        user.solvedProblems.push(problemId);
        user.totalSolved += 1;
        await user.save();
      }
      
      // Update problem statistics
      problem.solvedCount += 1;
      problem.totalSubmissions += 1;
      await problem.save();
    } else {
      // Add to attempted problems if not already solved
      if (!user.solvedProblems.includes(problemId) && 
          !user.attemptedProblems.includes(problemId)) {
        user.attemptedProblems.push(problemId);
        await user.save();
      }
      
      // Update problem statistics
      problem.totalSubmissions += 1;
      await problem.save();
    }
    
    // Update user streak
    user.updateStreak();
    await user.recordSubmission();
    await user.save();
    
    await submission.save();

    // Return only visible test results to the user
    const visibleTestResults = testResults.filter((_, index) => 
      !problem.testCases[index].isHidden
    );

    return res.status(201).json({
      success: true,
      submission: {
        _id: submission._id,
        status: submission.status,
        testResults: visibleTestResults,
        passedTestCases: submission.passedTestCases,
        totalTestCases: submission.totalTestCases,
        executionTime: submission.executionTime,
        submittedAt: submission.submittedAt
      }
    });
  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error processing submission',
      error: error.message 
    });
  }
};

// Get a submission by ID
exports.getSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    // Only allow users to view their own submissions or admins
    if (submission.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this submission' 
      });
    }

    // Get the problem to check which test cases are hidden
    const problem = await Problem.findById(submission.problem);
    if (!problem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Problem associated with submission not found' 
      });
    }

    // Filter out hidden test cases for regular users (admins can see all)
    let filteredTestResults = submission.testResults;
    if (req.user.role !== 'admin') {
      filteredTestResults = submission.testResults.filter((result, index) => 
        !problem.testCases[index]?.isHidden
      );
    }

    // Return submission with filtered test results
    return res.status(200).json({
      success: true,
      submission: {
        _id: submission._id,
        user: submission.user,
        problem: submission.problem,
        language: submission.language,
        code: req.user.role === 'admin' ? submission.code : undefined, // Only admins can see the code
        status: submission.status,
        testResults: filteredTestResults,
        passedTestCases: submission.passedTestCases,
        totalTestCases: submission.totalTestCases,
        executionTime: submission.executionTime,
        memoryUsed: submission.memoryUsed,
        submittedAt: submission.submittedAt
      }
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching submission',
      error: error.message 
    });
  }
};

// Get all submissions for a user
exports.getUserSubmissions = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Regular users can only view their own submissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view these submissions' 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ user: userId })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('problem', 'title difficulty')
      .select('-code -testResults'); // Exclude code and detailed test results for list view

    const totalSubmissions = await Submission.countDocuments({ user: userId });

    return res.status(200).json({
      success: true,
      submissions,
      pagination: {
        total: totalSubmissions,
        page,
        limit,
        pages: Math.ceil(totalSubmissions / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching user submissions',
      error: error.message 
    });
  }
};

// Get all submissions for a problem
exports.getProblemSubmissions = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    // Only admins can view all submissions for a problem
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view these submissions' 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ problem: problemId })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username')
      .select('-code -testResults'); // Exclude code and detailed test results for list view

    const totalSubmissions = await Submission.countDocuments({ problem: problemId });

    return res.status(200).json({
      success: true,
      submissions,
      pagination: {
        total: totalSubmissions,
        page,
        limit,
        pages: Math.ceil(totalSubmissions / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching problem submissions:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching problem submissions',
      error: error.message 
    });
  }
}; 

// Run code against test cases without creating a full submission
exports.runTests = async (req, res) => {
  try {
    const { problemId, code, language, isFullProgram } = req.body;
    const userId = req.user.id; // Assuming auth middleware provides user info

    if (!code || !language || !problemId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code, language, and problem ID are required for testing' 
      });
    }

    // Check if supported language
    const supportedLanguages = ['javascript', 'python', 'java', 'cpp'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({ 
        success: false, 
        message: `Unsupported language: ${language}. Supported languages: ${supportedLanguages.join(', ')}` 
      });
    }

    // Find the problem to get test cases
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Problem not found' 
      });
    }

    // Execute code against test cases
    const codeExecutor = new CodeExecutor();
    const testResults = [];
    let allTestsPassed = true;
    let totalExecutionTime = 0;

    for (const testCase of problem.testCases) {
      // Only run non-hidden tests for the 'Run Tests' feature
      if (!testCase.isHidden) {
        try {
          const timeLimit = problem.timeLimit || 1000; // milliseconds
          const start = Date.now();
          const result = await codeExecutor.executeTestCase(
            code, 
            language, 
            testCase.input, 
            testCase.expected, 
            timeLimit,
            !!isFullProgram
          );
          const executionTime = Date.now() - start;
          totalExecutionTime += executionTime;

          const testResult = {
            testCaseId: testCase._id,
            passed: result.passed,
            output: result.output,
            expectedOutput: testCase.expected,
            executionTime,
            error: result.error || null
          };

          testResults.push(testResult);
          if (!result.passed) {
            allTestsPassed = false;
          }
        } catch (error) {
          testResults.push({
            testCaseId: testCase._id,
            passed: false,
            output: null,
            expectedOutput: testCase.expected,
            executionTime: 0,
            error: error.message
          });
          allTestsPassed = false;
        }
      }
    }

    return res.status(200).json({
      success: true,
      results: {
        allPassed: allTestsPassed,
        testResults: testResults, // Contains results only for non-hidden tests
        totalExecutionTime: totalExecutionTime
      }
    });

  } catch (error) {
    console.error('Run tests error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error running tests',
      error: error.message 
    });
  }
};