// Load environment variables
const dotenv = require('dotenv');
dotenv.config();

// Import express and other dependencies
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

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
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
      successRate: 75,
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
      inputFormat: "An array of integers nums and an integer target.",
      outputFormat: "Return indices of the two numbers such that they add up to target.",
      constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
        },
        {
          input: "nums = [3,2,4], target = 6",
          output: "[1,2]",
          explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
        }
      ],
      hints: [
        "Try using a hash map to store values and their indices.",
        "As you iterate through the array, check if (target - current value) exists in your hash map.",
        "Remember to update your hash map with each new value and index."
      ],
      starterCode: "function twoSum(nums, target) {\n  // Write your code here\n}"
    },
    {
      id: 2,
      title: "Valid Parentheses",
      difficulty: "Easy",
      tags: ["Stack", "String"],
      solvedCount: 95,
      successRate: 68,
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
      inputFormat: "A string s containing only the characters '(', ')', '{', '}', '[' and ']'.",
      outputFormat: "Return true if the input string is valid, false otherwise.",
      constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
      examples: [
        {
          input: "s = \"()\"",
          output: "true"
        },
        {
          input: "s = \"()[]{}\"",
          output: "true"
        },
        {
          input: "s = \"(]\"",
          output: "false"
        }
      ],
      hints: [
        "Consider using a stack data structure.",
        "Push opening brackets onto the stack.",
        "When encountering a closing bracket, check if it matches the most recent opening bracket (top of stack).",
        "The string is valid if the stack is empty at the end."
      ],
      starterCode: "function isValid(s) {\n  // Write your code here\n}"
    },
    {
      id: 3,
      title: "Merge Two Sorted Lists",
      difficulty: "Easy",
      tags: ["Linked List", "Recursion"],
      solvedCount: 87,
      successRate: 70,
      description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
      inputFormat: "Two sorted linked lists list1 and list2.",
      outputFormat: "Return the merged list.",
      constraints: "The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100\nBoth list1 and list2 are sorted in non-decreasing order.",
      examples: [
        {
          input: "list1 = [1,2,4], list2 = [1,3,4]",
          output: "[1,1,2,3,4,4]"
        },
        {
          input: "list1 = [], list2 = []",
          output: "[]"
        },
        {
          input: "list1 = [], list2 = [0]",
          output: "[0]"
        }
      ],
      hints: [
        "Compare the first nodes of both lists.",
        "Recursively merge the rest of the lists.",
        "Make sure to handle the case where one or both lists are empty."
      ],
      starterCode: "function mergeTwoLists(list1, list2) {\n  // Write your code here\n}"
    }
  ];
  
  res.json(problems);
});

// Problem details endpoint
app.get('/api/problems/:id', (req, res) => {
  const problemId = parseInt(req.params.id);
  const problems = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      tags: ["Array", "Hash Table"],
      solvedCount: 120,
      successRate: 75,
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
      inputFormat: "An array of integers nums and an integer target.",
      outputFormat: "Return indices of the two numbers such that they add up to target.",
      constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
        },
        {
          input: "nums = [3,2,4], target = 6",
          output: "[1,2]",
          explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
        }
      ],
      hints: [
        "Try using a hash map to store values and their indices.",
        "As you iterate through the array, check if (target - current value) exists in your hash map.",
        "Remember to update your hash map with each new value and index."
      ],
      starterCode: "function twoSum(nums, target) {\n  // Write your code here\n}",
      workingSolution: `function twoSum(nums, target) {
  // Create a hash map to store values and their indices
  const map = new Map();
  
  // Iterate through the array
  for (let i = 0; i < nums.length; i++) {
    // Calculate the complement needed to reach the target
    const complement = target - nums[i];
    
    // Check if the complement exists in our map
    if (map.has(complement)) {
      // Return the indices of the two numbers
      return [map.get(complement), i];
    }
    
    // If not found, add the current value and its index to the map
    map.set(nums[i], i);
  }
  
  // If no solution is found (shouldn't happen according to the problem)
  return null;
}`
    },
    {
      id: 2,
      title: "Valid Parentheses",
      difficulty: "Easy",
      tags: ["Stack", "String"],
      solvedCount: 95,
      successRate: 68,
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
      inputFormat: "A string s containing only the characters '(', ')', '{', '}', '[' and ']'.",
      outputFormat: "Return true if the input string is valid, false otherwise.",
      constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
      examples: [
        {
          input: "s = \"()\"",
          output: "true"
        },
        {
          input: "s = \"()[]{}\"",
          output: "true"
        },
        {
          input: "s = \"(]\"",
          output: "false"
        }
      ],
      hints: [
        "Consider using a stack data structure.",
        "Push opening brackets onto the stack.",
        "When encountering a closing bracket, check if it matches the most recent opening bracket (top of stack).",
        "The string is valid if the stack is empty at the end."
      ],
      starterCode: "function isValid(s) {\n  // Write your code here\n}",
      workingSolution: `function isValid(s) {
  // Create a stack to keep track of opening brackets
  const stack = [];
  
  // Define the matching pairs of brackets
  const pairs = {
    '(': ')',
    '[': ']',
    '{': '}'
  };
  
  // Iterate through each character in the string
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    
    // If it's an opening bracket, push to stack
    if (pairs[char]) {
      stack.push(char);
    } else {
      // If it's a closing bracket, check if it matches the top of the stack
      const top = stack.pop();
      
      // If the stack is empty or the brackets don't match, return false
      if (!top || pairs[top] !== char) {
        return false;
      }
    }
  }
  
  // The string is valid if the stack is empty at the end
  return stack.length === 0;
}`
    },
    {
      id: 3,
      title: "Merge Two Sorted Lists",
      difficulty: "Easy",
      tags: ["Linked List", "Recursion"],
      solvedCount: 87,
      successRate: 70,
      description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
      inputFormat: "Two sorted linked lists list1 and list2.",
      outputFormat: "Return the merged list.",
      constraints: "The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100\nBoth list1 and list2 are sorted in non-decreasing order.",
      examples: [
        {
          input: "list1 = [1,2,4], list2 = [1,3,4]",
          output: "[1,1,2,3,4,4]"
        },
        {
          input: "list1 = [], list2 = []",
          output: "[]"
        },
        {
          input: "list1 = [], list2 = [0]",
          output: "[0]"
        }
      ],
      hints: [
        "Compare the first nodes of both lists.",
        "Recursively merge the rest of the lists.",
        "Make sure to handle the case where one or both lists are empty."
      ],
      starterCode: "function mergeTwoLists(list1, list2) {\n  // Write your code here\n}",
      workingSolution: `function mergeTwoLists(list1, list2) {
  // If either list is empty, return the other list
  if (!list1) return list2;
  if (!list2) return list1;
  
  // Create a dummy node as the starting point
  const dummy = { val: -1, next: null };
  let current = dummy;
  
  // Traverse both lists and compare values
  while (list1 && list2) {
    if (list1.val <= list2.val) {
      current.next = list1;
      list1 = list1.next;
    } else {
      current.next = list2;
      list2 = list2.next;
    }
    current = current.next;
  }
  
  // Attach the remaining nodes from whichever list is not empty
  current.next = list1 || list2;
  
  // Return the merged list starting from the first actual node
  return dummy.next;
}`
    }
  ];
  
  const problem = problems.find(p => p.id === problemId);
  
  if (!problem) {
    return res.status(404).json({ message: 'Problem not found' });
  }
  
  res.json(problem);
});

// Add a test case execution endpoint
app.post('/api/submissions/test', (req, res) => {
  const { code, language, problemId } = req.body;
  
  // Sample test case execution results
  const testResults = [
    {
      testCaseId: 1,
      passed: true,
      input: "[2,7,11,15], 9",
      expectedOutput: "[0,1]",
      output: "[0,1]",
      executionTime: 5
    },
    {
      testCaseId: 2,
      passed: true,
      input: "[3,2,4], 6",
      expectedOutput: "[1,2]",
      output: "[1,2]",
      executionTime: 3
    }
  ];
  
  // Simulate execution time
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Code executed successfully',
      testResults,
      output: 'All test cases passed!'
    });
  }, 1000);
});

// Add a solution submission endpoint
app.post('/api/submissions', (req, res) => {
  const { code, language, problemId } = req.body;
  
  // Sample submission result
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Solution submitted successfully',
      submissionId: 'sub_' + Date.now(),
      status: 'accepted',
      executionTime: 8,
      memoryUsed: 48
    });
  }, 1500);
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

// Start server
const PORT = process.env.PORT || 7000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
});

// Handle errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

module.exports = server;