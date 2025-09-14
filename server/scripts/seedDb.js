require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Problem = require('../models/Problem');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codequest', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  seedDatabase();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Seed data
async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Problem.deleteMany({});
    
    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',  // This will be hashed by the model's pre-save hook
      name: 'Admin User',
      role: 'admin'
    });
    
    const savedAdmin = await adminUser.save();
    console.log('Admin user created');
    
    // Create sample problems
    const problems = [
      {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'Easy',
        constraints: 'You may assume that each input would have exactly one solution, and you may not use the same element twice.',
        inputFormat: 'An array of integers and a target integer.',
        outputFormat: 'An array of two integers representing the indices.',
        sampleInput: '[2,7,11,15], target = 9',
        sampleOutput: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
        hints: [
          'Try using a hash map to store values you\'ve seen.',
          'For each element, check if its complement exists in the map.'
        ],
        testCases: [
          {
            input: { nums: [2, 7, 11, 15], target: 9 },
            expected: [0, 1],
            explanation: 'nums[0] + nums[1] = 2 + 7 = 9'
          },
          {
            input: { nums: [3, 2, 4], target: 6 },
            expected: [1, 2],
            explanation: 'nums[1] + nums[2] = 2 + 4 = 6'
          },
          {
            input: { nums: [3, 3], target: 6 },
            expected: [0, 1],
            explanation: 'nums[0] + nums[1] = 3 + 3 = 6'
          },
          {
            input: { nums: [1, 5, 8, 3, 9, 2], target: 7 },
            expected: [0, 5],
            explanation: 'nums[0] + nums[5] = 1 + 6 = 7',
            isHidden: true
          }
        ],
        tags: ['Array', 'Hash Table'],
        starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your code here
    
    // Return the indices of the two numbers that add up to the target
}

// Do not modify the code below
const output = twoSum(input.nums, input.target);`,
          python: `def two_sum(nums, target):
    # Your code here
    
    # Return the indices of the two numbers that add up to the target
    
# Do not modify the code below
output = two_sum(input["nums"], input["target"])`
        },
        solutionCode: {
          javascript: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
          python: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
        },
        author: savedAdmin._id
      },
      {
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        difficulty: 'Easy',
        constraints: 'An input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
        inputFormat: 'A string containing only parentheses characters.',
        outputFormat: 'true if the string is valid, false otherwise.',
        sampleInput: '()[]{}',
        sampleOutput: 'true',
        explanation: 'The parentheses, brackets, and braces all match and are closed in the correct order.',
        hints: [
          'Use a stack to keep track of opening brackets.',
          'When you encounter a closing bracket, check if it matches the most recent opening bracket.'
        ],
        testCases: [
          {
            input: '()',
            expected: true,
            explanation: 'Simple matching parentheses.'
          },
          {
            input: '()[]{}',
            expected: true,
            explanation: 'Multiple pairs of different types.'
          },
          {
            input: '(]',
            expected: false,
            explanation: 'Mismatched brackets.'
          },
          {
            input: '([)]',
            expected: false,
            explanation: 'Incorrect closing order.',
            isHidden: true
          },
          {
            input: '{[]}',
            expected: true,
            explanation: 'Nested brackets that match.',
            isHidden: true
          }
        ],
        tags: ['Stack', 'String'],
        author: savedAdmin._id
      }
    ];
    
    for (const problemData of problems) {
      const problem = new Problem(problemData);
      await problem.save();
    }
    
    console.log(`${problems.length} problems created`);
    console.log('Database successfully seeded! 🌱');
    
    // Close the connection
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}
