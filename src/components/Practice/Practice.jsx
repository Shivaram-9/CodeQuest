import { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlay, FaRedo, FaSave, FaCog, FaLightbulb, FaRobot, FaBook, FaVideo, FaChartLine, FaCode, FaQuestion, FaComments, FaTrophy, FaCheck, FaTimes, FaDownload, FaChevronRight, FaChevronDown, FaFilter, FaSort, FaSearch, FaEye, FaListAlt, FaChevronLeft, FaMagic, FaBrain, FaChartBar, FaRocket, FaFire, FaStar, FaBolt, FaClock, FaPause, FaStopwatch, FaUndoAlt } from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './Practice.css';
import PomodoroTimer from './PomodoroTimer';

// Add fallback AI data right after the API_BASE_URL constant
const API_BASE_URL = 'http://localhost:5002/api';

// Fallback data for when the API fails
const fallbackAIResponses = {
  hints: {
    'Two Sum': [
      "Think about using a hash map to track numbers you've already seen.",
      "For each number, check if target - number is already in your hash map.",
      "The hash map approach allows you to solve this in O(n) time complexity rather than O(n²) with nested loops."
    ],
    'Valid Parentheses': [
      "Use a stack data structure to keep track of opening brackets.",
      "When you encounter a closing bracket, it should match the most recent opening bracket.",
      "Remember to check if the stack is empty at the end - a non-empty stack means unclosed brackets."
    ],
    'Maximum Subarray': [
      "Look into Kadane's algorithm for an efficient O(n) solution.",
      "At each position, you need to decide whether to start a new subarray or extend the existing one.",
      "Track both the current sum and the maximum sum found so far."
    ],
    'Merge Two Sorted Lists': [
      "Create a dummy head node to simplify handling edge cases.",
      "Maintain a 'tail' pointer to build your result list efficiently.",
      "Iterate through both lists, always choosing the smaller value to add next."
    ],
    'Best Time to Buy and Sell Stock': [
      "Track the minimum price seen so far as you iterate through the array.",
      "For each price, calculate the potential profit if you sold at that price.",
      "Keep updating the maximum profit as you go through the prices."
    ]
  },
  analysis: {
    'Two Sum': {
      analyze: "Your solution is checking every possible pair of numbers which gives O(n²) time complexity. Consider using a hash map to track numbers you've already seen for better performance.",
      optimize: "For optimal performance: 1) Create a hash map to store values and their indices. 2) For each number, check if (target - num) exists in the map. 3) If found, return both indices. This achieves O(n) time complexity."
    },
    'Valid Parentheses': {
      analyze: "Your solution needs to handle different types of brackets correctly. Make sure you're using a stack to track opening brackets and checking each closing bracket against the most recent opening bracket.",
      optimize: "Optimize by: 1) Using a map/object to track bracket pairs. 2) Pushing opening brackets onto a stack. 3) When seeing a closing bracket, check if it matches the top of the stack. 4) Return true only if all brackets are matched and the stack is empty."
    },
    'Maximum Subarray': {
      analyze: "Check if you're correctly implementing Kadane's algorithm. Your current approach may not correctly handle negative numbers in the array.",
      optimize: "Implement Kadane's algorithm: 1) Keep track of current sum and max sum. 2) For each element, decide if it's better to start a new subarray or extend the current one. 3) Update max sum when current sum increases."
    }
  },
  performance: {
    efficiency: 0.75,
    readability: 0.8,
    optimization: 0.7
  }
};

// Fallback problem details for UI rendering
const problemDetails = {
  'Two Sum': {
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    inputFormat: 'An array of integers nums and an integer target.',
    outputFormat: 'Return indices of the two numbers such that they add up to target.',
    constraints: '2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9, Only one valid answer exists.',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      }
    ],
    hints: [
      'Try using a hash map to store values and their indices.',
      'As you iterate through the array, check if (target - current value) exists in your hash map.',
      'Remember to update your hash map with each new value and index.'
    ]
  },
  'Valid Parentheses': {
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    inputFormat: 'A string s containing only the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\'.',
    outputFormat: 'Return true if the input string is valid, false otherwise.',
    constraints: '1 <= s.length <= 10^4, s consists of parentheses only \'()[]{}\'.',
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ],
    hints: [
      'Consider using a stack data structure.',
      'Push opening brackets onto the stack.',
      'When encountering a closing bracket, check if it matches the most recent opening bracket.',
      'The string is valid if the stack is empty at the end.'
    ]
  },
  'Longest Common Prefix': {
    description: 'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string "".',
    inputFormat: 'An array of strings strs.',
    outputFormat: 'Return the longest common prefix string.',
    constraints: '1 <= strs.length <= 200, 0 <= strs[i].length <= 200, strs[i] consists of only lowercase English letters.',
    examples: [
      {
        input: 'strs = ["flower","flow","flight"]',
        output: '"fl"',
        explanation: 'The first two characters "fl" are common to all three strings.'
      },
      {
        input: 'strs = ["dog","racecar","car"]',
        output: '""',
        explanation: 'There is no common prefix among the input strings.'
      }
    ],
    hints: [
      'Compare characters at the same position in all strings.',
      'Start with the first character and move right until you find a mismatch.',
      'Use the first string as a reference and compare it with other strings.'
    ]
  }
};

// AI-powered code analysis and suggestion system
const analyzeCode = async (code, language) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/analyze`, {
      code,
      language,
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing code:', error);
    return null;
  }
};

// AI-powered visualization generator
const generateVisualization = async (algorithm, data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/visualize`, {
      algorithm,
      data,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating visualization:', error);
    return null;
  }
};

// AI-powered challenge recommendation system
const getRecommendations = async (userId, skillLevel, completedChallenges) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/recommend`, {
      userId,
      skillLevel,
      completedChallenges,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
};

// In the supportedLanguages array, move Java to the top
const supportedLanguages = [
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'csharp', name: 'C#', extension: 'cs' },
  { id: 'c', name: 'C', extension: 'c' },
  { id: 'go', name: 'Go', extension: 'go' },
  { id: 'kotlin', name: 'Kotlin', extension: 'kt' }
];

// Hardcoded problems data to avoid API calls
const hardcodedProblems = [
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
      "When encountering a closing bracket, check if it matches the most recent opening bracket.",
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
  },
  {
    id: 4,
    title: "Palindrome Number",
    difficulty: "Easy",
    tags: ["Math"],
    solvedCount: 112,
    successRate: 72,
    starterCode: "class Solution {\n    public boolean isPalindrome(int x) {\n        // Write your code here\n        return false;\n    }\n}",
    description: "Given an integer x, return true if x is a palindrome, and false otherwise. A palindrome is a number that reads the same forward and backward.",
    inputFormat: "An integer x.",
    outputFormat: "Return true if x is a palindrome, and false otherwise.",
    constraints: "-2^31 <= x <= 2^31 - 1",
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left."
      },
      {
        input: "x = -121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."
      },
      {
        input: "x = 10",
        output: "false",
        explanation: "Reads 01 from right to left. Therefore it is not a palindrome."
      }
    ],
    hints: [
      "Could you solve it without converting the integer to a string?",
      "Try reversing half of the number and compare with the other half.",
      "Remember to handle negative numbers and numbers ending with 0."
    ]
  },
  {
    id: 5,
    title: "Binary Search",
    difficulty: "Easy",
    tags: ["Array", "Binary Search"],
    solvedCount: 106,
    successRate: 78,
    starterCode: "class Solution {\n    public int search(int[] nums, int target) {\n        // Write your code here\n        return -1;\n    }\n}",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.",
    inputFormat: "A sorted array of integers nums and an integer target.",
    outputFormat: "Return the index of target in the array, or -1 if it doesn't exist.",
    constraints: "1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll the integers in nums are unique.\nnums is sorted in ascending order.",
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists in nums and its index is 4"
      },
      {
        input: "nums = [-1,0,3,5,9,12], target = 2",
        output: "-1",
        explanation: "2 does not exist in nums so return -1"
      }
    ],
    hints: [
      "Use binary search to achieve O(log n) time complexity.",
      "Keep track of left and right pointers to narrow down the search space.",
      "Be careful with the termination condition and mid-point calculation."
    ]
  },
  {
    id: 6,
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["Array", "Dynamic Programming"],
    solvedCount: 92,
    successRate: 65,
    starterCode: "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}",
    description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    inputFormat: "An array of integers nums.",
    outputFormat: "Return the sum of the contiguous subarray with the largest sum.",
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The contiguous subarray [4,-1,2,1] has the largest sum = 6."
      },
      {
        input: "nums = [1]",
        output: "1"
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
        explanation: "The contiguous subarray [5,4,-1,7,8] has the largest sum = 23."
      }
    ],
    hints: [
      "Consider using Kadane's algorithm for an efficient O(n) solution.",
      "For each position, decide whether to start a new subarray or extend the existing one.",
      "Keep track of both the current sum and the maximum sum found so far."
    ]
  },
  {
    id: 7,
    title: "Reverse Linked List",
    difficulty: "Easy",
    tags: ["Linked List"],
    solvedCount: 104,
    successRate: 73,
    starterCode: "/**\n * Definition for singly-linked list.\n * public class ListNode {\n *     int val;\n *     ListNode next;\n *     ListNode() {}\n *     ListNode(int val) { this.val = val; }\n *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n * }\n */\nclass Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your code here\n        return null;\n    }\n}",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    inputFormat: "The head of a singly linked list.",
    outputFormat: "Return the head of the reversed linked list.",
    constraints: "The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000",
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]"
      },
      {
        input: "head = [1,2]",
        output: "[2,1]"
      },
      {
        input: "head = []",
        output: "[]"
      }
    ],
    hints: [
      "Try using three pointers: prev, curr, and next to keep track of nodes while reversing.",
      "Initialize prev as null and curr as head.",
      "In each iteration, store curr.next, update curr.next to prev, move prev to curr, and curr to the stored next."
    ]
  },
  {
    id: 8,
    title: "Container With Most Water",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Greedy"],
    solvedCount: 83,
    successRate: 61,
    starterCode: "class Solution {\n    public int maxArea(int[] height) {\n        // Write your code here\n        return 0;\n    }\n}",
    description: "Given n non-negative integers a1, a2, ..., an , where each represents a point at coordinate (i, ai). n vertical lines are drawn such that the two endpoints of the line i is at (i, ai) and (i, 0). Find two lines, which, together with the x-axis forms a container, such that the container contains the most water.",
    inputFormat: "An integer array height of length n.",
    outputFormat: "Return the maximum amount of water a container can store.",
    constraints: "n == height.length\n2 <= n <= 10^5\n0 <= height[i] <= 10^4",
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49",
        explanation: "The vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water the container can contain is 49."
      },
      {
        input: "height = [1,1]",
        output: "1"
      }
    ],
    hints: [
      "The amount of water contained between two lines is determined by the shorter line and the distance between them.",
      "Try using two pointers, initially at the first and last elements.",
      "Move the pointer pointing to the shorter line inward to potentially find a greater area."
    ]
  },
  {
    id: 9,
    title: "Longest Common Prefix",
    difficulty: "Easy",
    tags: ["String"],
    solvedCount: 101,
    successRate: 70,
    starterCode: "class Solution {\n    public String longestCommonPrefix(String[] strs) {\n        // Write your code here\n        return \"\";\n    }\n}",
    description: "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string \"\".",
    inputFormat: "An array of strings strs.",
    outputFormat: "Return the longest common prefix string.",
    constraints: "1 <= strs.length <= 200\n0 <= strs[i].length <= 200\nstrs[i] consists of only lowercase English letters.",
    examples: [
      {
        input: "strs = [\"flower\",\"flow\",\"flight\"]",
        output: "\"fl\"",
        explanation: "The first two characters \"fl\" are common to all three strings."
      },
      {
        input: "strs = [\"dog\",\"racecar\",\"car\"]", 
        output: "\"\"",
        explanation: "There is no common prefix among the input strings."
      }
    ],
    hints: [
      "Compare characters at the same position in all strings.",
      "Start with the first character and move right until you find a mismatch.",
      "Use the first string as a reference and compare it with other strings."
    ]
  },
  {
    id: 10,
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    solvedCount: 92,
    successRate: 65,
    starterCode: "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}",
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    inputFormat: "An array of integers nums.",
    outputFormat: "The sum of the subarray with the largest sum.",
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6."
      },
      {
        input: "nums = [1]",
        output: "1",
        explanation: "The subarray [1] has the largest sum 1."
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
        explanation: "The subarray [5,4,-1,7,8] has the largest sum 23."
      }
    ],
    hints: [
      "Use Kadane's algorithm for an O(n) solution.",
      "For each element, decide whether to start a new subarray or extend the existing one.",
      "Keep track of both the current sum and the maximum sum found so far."
    ]
  }
];

const Practice = () => {
  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [editorValue, setEditorValue] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [isFullProgram, setIsFullProgram] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('problem');
  const [problemSubmissions, setProblemSubmissions] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // AI-specific states
  const [codeAnalysis, setCodeAnalysis] = useState(null);
  const [algorithmVisualization, setAlgorithmVisualization] = useState(null);
  const [recommendedProblems, setRecommendedProblems] = useState([]);
  const [showVisualization, setShowVisualization] = useState(false);
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loadingHints, setLoadingHints] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [aiResponse, setAiResponse] = useState('');
  const [aiAnalysisMode, setAiAnalysisMode] = useState('analyze');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [geminiHints, setGeminiHints] = useState([]);
  const [showAiDropdown, setShowAiDropdown] = useState(false);

  // Add user skill level and preferences
  const [userSkillLevel, setUserSkillLevel] = useState('beginner');
  const [userPreferences, setUserPreferences] = useState({
    preferredLanguages: ['java', 'python'],
    difficultyPreference: 'medium',
    learningStyle: 'visual'
  });

  // Add userProgress state
  const [userProgress, setUserProgress] = useState({
    level: 5,
    xp: 4250,
    streak: 7,
    badges: ['algorithm-master', 'bug-hunter', 'code-optimizer']
  });

  // Pomodoro Timer State
  const [showPomodoro, setShowPomodoro] = useState(false);
  
  // Pomodoro settings
  const pomodoroSettings = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  const GEMINI_API_KEY = import.meta.env.VITE_REACT_APP_GEMINI_API_KEY || "AIzaSyAVdOCeHQ043LmPcbKMcAMU0tEP1d-7e_g";

  // Helper function to get color for difficulty
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return '#00b8a3'; // green
      case 'Medium':
        return '#ffc01e'; // yellow
      case 'Hard':
        return '#ff375f'; // red
      default:
        return '#6c757d'; // gray
    }
  };

  // Helper function to get badge title
  const getBadgeTitle = (badge) => {
    switch (badge) {
      case 'algorithm-master':
        return 'Algorithm Master: Completed 10 algorithm challenges';
      case 'bug-hunter':
        return 'Bug Hunter: Found and fixed 5 bugs in your code';
      case 'code-optimizer':
        return 'Code Optimizer: Improved code efficiency in 3 challenges';
      case 'streak-warrior':
        return 'Streak Warrior: Maintained a 7-day streak';
      case 'problem-solver':
        return 'Problem Solver: Solved 20 coding problems';
      default:
        return badge.replace('-', ' ');
    }
  };

  // Helper function to get badge icon
  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'algorithm-master':
        return <FaBrain />;
      case 'bug-hunter':
        return <FaSearch />;
      case 'code-optimizer':
        return <FaBolt />;
      case 'streak-warrior':
        return <FaFire />;
      case 'problem-solver':
        return <FaTrophy />;
      default:
        return <FaStar />;
    }
  };

  // Format time helper function
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'x-api-key': GEMINI_API_KEY
    };
  };

  const handleAPIError = (error, fallbackData) => {
    console.error('API Error:', error);
    setError(error.message || 'An error occurred while processing your request');
    return fallbackData;
  };

  // Add updateUserProgress function
  const updateUserProgress = (xp) => {
    setUserProgress(prev => {
      const newXp = prev.xp + xp;
      const newLevel = Math.floor(newXp / 1000) + 1;
      
      return {
        ...prev,
        xp: newXp,
        level: newLevel
      };
    });
  };

  // Modify the useEffect to use hardcoded data instead of API calls
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        // Hardcoded data instead of API call
        const hardcodedProblems = [
          {
            id: 1,
            title: "Two Sum",
            difficulty: "Easy",
            tags: ["Array", "Hash Table"],
            solvedCount: 120,
            successRate: 75,
            starterCode: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return null;\n    }\n}",
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
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
            ]
          },
          {
            id: 2,
            title: "Valid Parentheses",
            difficulty: "Easy",
            tags: ["Stack", "String"],
            solvedCount: 95,
            successRate: 68,
            starterCode: "class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n}",
            description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
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
              "When encountering a closing bracket, check if it matches the most recent opening bracket.",
              "The string is valid if the stack is empty at the end."
            ]
          },
          {
            id: 3,
            title: "Merge Two Sorted Lists",
            difficulty: "Easy",
            tags: ["Linked List", "Recursion"],
            solvedCount: 87,
            successRate: 70,
            starterCode: "class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Write your code here\n        return null;\n    }\n}",
            description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.",
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
            ]
          },
          {
            id: 4,
            title: "Longest Common Prefix",
            difficulty: "Easy",
            tags: ["String"],
            solvedCount: 101,
            successRate: 70,
            starterCode: "class Solution {\n    public String longestCommonPrefix(String[] strs) {\n        // Write your code here\n        return \"\";\n    }\n}",
            description: "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string \"\".",
            inputFormat: "An array of strings strs.",
            outputFormat: "Return the longest common prefix string.",
            constraints: "1 <= strs.length <= 200\n0 <= strs[i].length <= 200\nstrs[i] consists of only lowercase English letters.",
            examples: [
              {
                input: "strs = [\"flower\",\"flow\",\"flight\"]",
                output: "\"fl\"",
                explanation: "The first two characters \"fl\" are common to all three strings."
              },
              {
                input: "strs = [\"dog\",\"racecar\",\"car\"]", 
                output: "\"\"",
                explanation: "There is no common prefix among the input strings."
              }
            ],
            hints: [
              "Compare characters at the same position in all strings.",
              "Start with the first character and move right until you find a mismatch.",
              "Use the first string as a reference and compare it with other strings."
            ]
          },
          {
            id: 5,
            title: "Maximum Subarray",
            difficulty: "Medium",
            tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
            solvedCount: 92,
            successRate: 65,
            starterCode: "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}",
            description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
            inputFormat: "An array of integers nums.",
            outputFormat: "The sum of the subarray with the largest sum.",
            constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
            examples: [
              {
                input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
                output: "6",
                explanation: "The subarray [4,-1,2,1] has the largest sum 6."
              },
              {
                input: "nums = [1]",
                output: "1",
                explanation: "The subarray [1] has the largest sum 1."
              },
              {
                input: "nums = [5,4,-1,7,8]",
                output: "23",
                explanation: "The subarray [5,4,-1,7,8] has the largest sum 23."
              }
            ],
            hints: [
              "Use Kadane's algorithm for an O(n) solution.",
              "For each element, decide whether to start a new subarray or extend the existing one.",
              "Keep track of both the current sum and the maximum sum found so far."
            ]
          },
          {
            id: 6,
            title: "Reverse Linked List",
            difficulty: "Easy",
            tags: ["Linked List", "Recursion"],
            solvedCount: 104,
            successRate: 73,
            starterCode: "class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your code here\n        return null;\n    }\n}",
            description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
            inputFormat: "The head of a singly linked list.",
            outputFormat: "The head of the reversed linked list.",
            constraints: "The number of nodes in the list is in the range [0, 5000].\n-5000 <= Node.val <= 5000",
      examples: [
        {
                input: "head = [1,2,3,4,5]",
                output: "[5,4,3,2,1]"
              },
              {
                input: "head = [1,2]",
                output: "[2,1]"
              },
              {
                input: "head = []",
                output: "[]"
              }
            ],
            hints: [
              "Use three pointers: previous, current, and next to reverse links.",
              "Initialize previous as null and current as head.",
              "In each iteration, save next, update current.next to previous, move previous to current, and current to next."
            ]
          },
          {
            id: 7,
            title: "Container With Most Water",
            difficulty: "Medium",
            tags: ["Array", "Two Pointers", "Greedy"],
            solvedCount: 83,
            successRate: 61,
            starterCode: "class Solution {\n    public int maxArea(int[] height) {\n        // Write your code here\n        return 0;\n    }\n}",
            description: "Given n non-negative integers a1, a2, ..., an, where each represents a point at coordinate (i, ai). n vertical lines are drawn such that the two endpoints of the line i is at (i, ai) and (i, 0). Find two lines, which, together with the x-axis forms a container, such that the container contains the most water.",
            inputFormat: "An integer array height of length n.",
            outputFormat: "Return the maximum amount of water a container can store.",
            constraints: "n == height.length\n2 <= n <= 10^5\n0 <= height[i] <= 10^4",
            examples: [
              {
                input: "height = [1,8,6,2,5,4,8,3,7]",
                output: "49",
                explanation: "The vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water the container can contain is 49."
              },
              {
                input: "height = [1,1]",
                output: "1"
        }
      ],
      hints: [
              "The amount of water is determined by the shorter line and the distance between lines.",
              "Use two pointers, initially at the first and last elements.",
              "Move the pointer pointing to the shorter line inward to potentially find a greater area."
            ]
          },
          {
            id: 8,
            title: "LRU Cache",
            difficulty: "Medium",
            tags: ["Hash Table", "Linked List", "Design"],
            solvedCount: 76,
            successRate: 58,
            starterCode: "class LRUCache {\n    \n    public LRUCache(int capacity) {\n        // Initialize your data structure here\n    }\n    \n    public int get(int key) {\n        // Write your code here\n        return 0;\n    }\n    \n    public void put(int key, int value) {\n        // Write your code here\n    }\n}",
            description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
            inputFormat: "Operations on the LRUCache class.",
            outputFormat: "Results of get operations.",
            constraints: "1 <= capacity <= 3000\n0 <= key <= 10^4\n0 <= value <= 10^5\nAt most 2 * 10^5 calls will be made to get and put.",
            examples: [
              {
                input: "LRUCache lRUCache = new LRUCache(2);\nlRUCache.put(1, 1);\nlRUCache.put(2, 2);\nlRUCache.get(1);\nlRUCache.put(3, 3);\nlRUCache.get(2);\nlRUCache.put(4, 4);\nlRUCache.get(1);\nlRUCache.get(3);\nlRUCache.get(4);",
                output: "[1,-1,-1,3,4]",
                explanation: "LRUCache lRUCache = new LRUCache(2);\nlRUCache.put(1, 1); // cache is {1=1}\nlRUCache.put(2, 2); // cache is {1=1, 2=2}\nlRUCache.get(1);    // return 1\nlRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3}\nlRUCache.get(2);    // returns -1 (not found)\nlRUCache.put(4, 4); // LRU key was 1, evicts key 1, cache is {4=4, 3=3}\nlRUCache.get(1);    // return -1 (not found)\nlRUCache.get(3);    // return 3\nlRUCache.get(4);    // return 4"
              }
            ],
            hints: [
              "Use a hash map and a doubly linked list to achieve O(1) time complexity for both get and put.",
              "The hash map provides fast lookup, while the doubly linked list maintains the order of usage.",
              "When a key is accessed, move it to the front of the list to mark it as most recently used."
            ]
          },
          {
            id: 9,
            title: "3Sum",
            difficulty: "Medium",
            tags: ["Array", "Two Pointers", "Sorting"],
            solvedCount: 81,
            successRate: 56,
            starterCode: "class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Write your code here\n        return null;\n    }\n}",
            description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
            inputFormat: "An array of integers nums.",
            outputFormat: "All unique triplets that sum to zero.",
            constraints: "3 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5",
            examples: [
              {
                input: "nums = [-1,0,1,2,-1,-4]",
                output: "[[-1,-1,2],[-1,0,1]]",
                explanation: "The triplets that sum to zero are [-1,0,1] and [-1,-1,2]."
              },
              {
                input: "nums = []",
                output: "[]"
              },
              {
                input: "nums = [0]",
                output: "[]"
              }
            ],
            hints: [
              "Sort the array first to help with finding unique triplets.",
              "Use a two-pointer approach for each fixed element to find pairs that sum to the negative of that element.",
              "Skip duplicate values to avoid duplicate triplets in the result."
            ]
          },
          {
            id: 10,
            title: "Trapping Rain Water",
            difficulty: "Hard",
            tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"],
            solvedCount: 68,
            successRate: 52,
            starterCode: "class Solution {\n    public int trap(int[] height) {\n        // Write your code here\n        return 0;\n    }\n}",
            description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
            inputFormat: "An array of integers representing the height map.",
            outputFormat: "The total amount of trapped rainwater.",
            constraints: "n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5",
            examples: [
              {
                input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
                output: "6",
                explanation: "The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped."
              },
              {
                input: "height = [4,2,0,3,2,5]",
                output: "9"
              }
            ],
            hints: [
              "For each element, the water trapped depends on the minimum of maximum height to its left and right, minus its own height.",
              "Use dynamic programming or a two-pointer approach for an efficient solution.",
              "Try to compute the left and right maximum heights in a single pass."
            ]
          }
        ];
        setProblems(hardcodedProblems);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching problems:', error);
        setIsLoading(false);
      }
    };
    fetchProblems();
  }, []);

  // Handle Pomodoro completion
  const handlePomodoroComplete = (mode) => {
    console.log(`Pomodoro ${mode} completed`);
    // Additional logic if needed
  };

  // Handle XP earned from Pomodoro
  const handlePomodoroXpEarned = (xp) => {
    updateUserProgress(xp);
  };

  // Problem selection handler
  const handleProblemSelect = (problem) => {
    setCurrentProblem(problem);
    
    // Set appropriate starter code based on selected language
    const defaultCode = problem.starterCode || `// Write your solution for ${problem.title} here`;
    setEditorValue(defaultCode);
    
    // Reset states
    setTestResults([]);
    setSubmissionStatus('');
    setConsoleOutput([]);
    setCodeAnalysis(null);
    setAiResponse('');
    setShowAiDropdown(false);
    
    // Switch to problem tab
    setActiveTab('problem');
    
    // Fetch submissions for this problem if needed
    // fetchProblemSubmissions(problem.id);
  };

  // Editor did mount handler
  const handleEditorDidMount = (editor, monaco) => {
    // Configure editor if needed
    editor.focus();
  };

  // AI action handler
  const handleAiAction = (action) => {
    setAiAnalysisMode(action);
    setShowAiDropdown(false);
    
    switch (action) {
      case 'analyze':
        analyzeCodeWithGemini('analyze');
        break;
      case 'optimize':
        analyzeCodeWithGemini('optimize');
        break;
      case 'hint':
        generateGeminiHint();
        break;
      default:
        break;
    }
  };

  // Language change handler
  const handleLanguageChange = (languageId) => {
    setSelectedLanguage(languageId);
    
    // Update editor value with appropriate starter code
    if (currentProblem) {
      // Here you would ideally have language-specific starter code
      // For now we'll just use the same starter code for all languages
      setEditorValue(currentProblem.starterCode || `// Write your solution for ${currentProblem.title} here`);
    }
  };

  // Code submission handler
  const handleSubmitCode = async () => {
    if (!currentProblem || !editorValue.trim()) {
      addConsoleOutput("Please select a problem and write some code first.", "error");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Simulate submission processing
      addConsoleOutput("Submitting code...", "info");
      
      // Timeout to simulate API call
    setTimeout(() => {
        const passed = Math.random() > 0.3; // 70% chance of passing for demo
        
        if (passed) {
          setSubmissionStatus('Accepted');
          addConsoleOutput("All test cases passed!", "success");
          
          // Add to submissions history
          const newSubmission = {
            id: Date.now(),
            problemId: currentProblem.id,
            problemTitle: currentProblem.title,
            code: editorValue,
            language: selectedLanguage,
            status: 'Accepted',
            runtime: Math.floor(Math.random() * 100) + 50,
            memory: (Math.random() * 10 + 35).toFixed(1),
            timestamp: new Date().toISOString(),
            testResults: currentProblem.examples.map(() => ({ passed: true }))
          };
          
          setProblemSubmissions(prev => [newSubmission, ...prev]);
          
          // Award XP for solving the problem
          updateUserProgress(currentProblem.difficulty === 'Easy' ? 50 : 
                            currentProblem.difficulty === 'Medium' ? 100 : 200);
        } else {
          setSubmissionStatus('Failed');
          addConsoleOutput("Some test cases failed.", "error");
          
          // Generate random test failures
          const testResults = currentProblem.examples.map((_, index) => {
            const passed = Math.random() > 0.4;
            return {
              passed,
              error: passed ? null : "Expected output not matched."
            };
          });
          
          setTestResults(testResults);
          
          // Add to submissions history
          const newSubmission = {
            id: Date.now(),
            problemId: currentProblem.id,
            problemTitle: currentProblem.title,
            code: editorValue,
            language: selectedLanguage,
            status: 'Failed',
            runtime: Math.floor(Math.random() * 100) + 50,
            memory: (Math.random() * 10 + 35).toFixed(1),
            timestamp: new Date().toISOString(),
            testResults
          };
          
          setProblemSubmissions(prev => [newSubmission, ...prev]);
        }
        
        setSubmitting(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmissionStatus('Error');
      addConsoleOutput(`Error submitting code: ${error.message}`, "error");
      setSubmitting(false);
    }
  };

  // Run test handler
  const handleRunTest = (example) => {
    if (!currentProblem || !editorValue.trim() || !example) {
      addConsoleOutput("Please select a problem with examples and write some code first.", "error");
      return;
    }
    
    addConsoleOutput(`Running test with input: ${example.input}`, "info");
    
    // Simulate test run
    setTimeout(() => {
      const passed = Math.random() > 0.3; // 70% chance of passing for demo
      
      if (passed) {
        addConsoleOutput(`Test passed! Output: ${example.output}`, "success");
        setTestResults([{ passed: true }]);
      } else {
        addConsoleOutput(`Test failed. Expected: ${example.output}`, "error");
        setTestResults([{ 
          passed: false, 
          error: `Expected: ${example.output}, but got: [incorrect output]`
        }]);
      }
    }, 1000);
  };

  // Add console output
  const addConsoleOutput = (message, type = "info") => {
    setConsoleOutput(prev => [...prev, { message, type }]);
  };

  // Gemini hint generator
  const generateGeminiHint = async () => {
    if (!currentProblem) return;
    
    setLoadingHints(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Get a random hint from fallback data or generate one
      const problemHints = fallbackAIResponses.hints[currentProblem.title] || [
        "Break down the problem into smaller steps.",
        "Think about edge cases in your solution.",
        "Consider a more efficient data structure for this problem.",
        "Look for patterns in the input examples."
      ];
      
      const randomHint = problemHints[Math.floor(Math.random() * problemHints.length)];
      
      setGeminiHints(prev => [...prev, randomHint]);
      setLoadingHints(false);
      
      if (activeTab !== 'hints') {
        setActiveTab('hints');
      }
    } catch (error) {
      console.error('Error generating hint:', error);
      setLoadingHints(false);
      addConsoleOutput("Error generating hint. Please try again.", "error");
    }
  };

  // Gemini code analysis
  const analyzeCodeWithGemini = async (mode) => {
    if (!currentProblem || !editorValue.trim()) {
      addConsoleOutput("Please write some code first.", "error");
      return;
    }
    
    setAiLoading(true);
    setShowAIHelper(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get analysis from fallback data or generate one
      let analysis;
      if (mode === 'analyze') {
        analysis = fallbackAIResponses.analysis[currentProblem.title]?.analyze || 
          "Your code looks generally correct. Consider time and space complexity optimizations. Check for edge cases like empty inputs or extreme values.";
      } else {
        analysis = fallbackAIResponses.analysis[currentProblem.title]?.optimize || 
          "Consider using a more efficient data structure. You can optimize the time complexity by avoiding nested loops. Look for ways to solve this in a single pass through the input.";
      }
      
      setAiResponse(analysis);
      setCodeAnalysis({
        performance: fallbackAIResponses.performance
      });
      
      setAiLoading(false);
    } catch (error) {
      console.error('Error analyzing code:', error);
      setAiLoading(false);
      setAiResponse("Error analyzing code. Please try again.");
    }
  };

  // Handle viewing a submitted solution
  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowSubmissionModal(true);
  };

  // Get performance color
  const getPerformanceColor = (value) => {
    if (value >= 0.8) return '#00b8a3'; // good (green)
    if (value >= 0.6) return '#ffc01e'; // average (yellow)
    return '#ff375f'; // poor (red)
  };

  // Mock community discussions
  const communityFeatures = {
    discussions: [
      {
        author: "JavaMaster",
        timestamp: Date.now() - 86400000, // 1 day ago
        content: "I found that using a HashMap for this problem greatly simplifies the solution and improves runtime performance."
      },
      {
        author: "AlgoExpert",
        timestamp: Date.now() - 3600000, // 1 hour ago
        content: "Be careful about edge cases like empty arrays or negative values in this problem."
      }
    ]
  };

  return (
    <div className="practice-container">
      {/* Header with User Progress */}
      <div className="practice-header">
        <div className="user-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(userProgress.xp % 1000) / 10}%` }}
            />
            <span className="level">Level {userProgress.level}</span>
          </div>
          <div className="stats">
            <span className="xp">{userProgress.xp} XP</span>
            <span className="streak"><FaFire /> {userProgress.streak} day streak</span>
        </div>
      </div>

        {/* Pomodoro Timer Toggle */}
        <div className="pomodoro-toggle">
          <button 
            className="pomodoro-button"
            onClick={() => setShowPomodoro(!showPomodoro)}
            title="Pomodoro Timer"
          >
            <FaClock /> {showPomodoro ? 'Hide Timer' : 'Pomodoro Timer'}
          </button>
          </div>

        <div className="badges-container">
          {userProgress.badges.map((badge, index) => (
            <div key={index} className="badge" title={getBadgeTitle(badge)}>
              {getBadgeIcon(badge)}
          </div>
              ))}
          </div>
        </div>

      {/* Pomodoro Timer */}
      {showPomodoro && (
        <PomodoroTimer 
          onComplete={handlePomodoroComplete}
          onXpEarned={handlePomodoroXpEarned}
        />
      )}

      {/* Main Content Area */}
      <div className="practice-content">
        {isLoading && <div className="loading-overlay">Loading...</div>}
        
        {/* Problem List Sidebar */}
        <div className="practice-sidebar">
          <div className="sidebar-header">
            <h3>Problems</h3>
            <div className="filter-controls">
              <select className="difficulty-filter">
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input type="text" placeholder="Search problems..." />
              </div>
            </div>
        </div>
          
          <div className="problem-list">
            {problems.map((problem) => (
              <div
                key={problem.id}
                className={`problem-item ${currentProblem?.id === problem.id ? 'active' : ''}`}
                onClick={() => handleProblemSelect(problem)}
              >
                <span className="problem-title">{problem.title}</span>
                <span 
                  className="difficulty" 
                  style={{backgroundColor: getDifficultyColor(problem.difficulty)}}
                >
                  {problem.difficulty}
                </span>
    </div>
            ))}
          </div>
          
          {recommendedProblems.length > 0 && (
            <div className="recommended-problems">
              <h4><FaRobot /> Recommended for you</h4>
              {recommendedProblems.map((problem) => (
                <div
                  key={problem.id}
                  className="problem-item recommended"
                  onClick={() => handleProblemSelect(problem)}
                >
                  <span className="problem-title">{problem.title}</span>
                  <span 
                    className="difficulty" 
                    style={{backgroundColor: getDifficultyColor(problem.difficulty)}}
                  >
                    {problem.difficulty}
                  </span>
          </div>
        ))}
      </div>
          )}
    </div>

        {/* Main Problem and Editor Area */}
        <div className="practice-main">
          {currentProblem ? (
            <>
              <div className="problem-header">
                <h2>{currentProblem.title}</h2>
                <div className="problem-meta">
                  <span 
                    className="difficulty" 
                    style={{backgroundColor: getDifficultyColor(currentProblem.difficulty)}}
                  >
                    {currentProblem.difficulty}
                  </span>
                  <span className="separator">•</span>
                  <span className="success-rate">{currentProblem.successRate} success rate</span>
                  <div className="ai-controls">
                    <button
                      className={`ai-toggle ${showAiDropdown ? 'active' : ''}`}
                      onClick={() => {
                        setShowAiDropdown(!showAiDropdown);
                        setAiAnalysisEnabled(true);
                      }}
                    >
                      <FaRobot /> AI Assistant
                    </button>
                    {showAiDropdown && (
                      <div className="ai-dropdown">
                        <button className="ai-option" onClick={() => handleAiAction('analyze')}>
                          <FaSearch /> Analyze Code
                        </button>
                        <button className="ai-option" onClick={() => handleAiAction('optimize')}>
                          <FaBolt /> Optimize Solution
                        </button>
                        <button className="ai-option" onClick={() => handleAiAction('hint')}>
                          <FaLightbulb /> Get Hint
        </button>
      </div>
                    )}
      </div>
    </div>
              </div>

              <div className="problem-content">
                <div className="tabs">
          <button
                    className={`tab ${activeTab === 'problem' ? 'active' : ''}`}
            onClick={() => setActiveTab('problem')}
          >
                    <FaQuestion /> Problem
          </button>
          <button
                    className={`tab ${activeTab === 'submissions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('submissions')}
          >
                    <FaListAlt /> Submissions
          </button>
          <button
                    className={`tab ${activeTab === 'hints' ? 'active' : ''}`}
                    onClick={() => setActiveTab('hints')}
          >
                    <FaLightbulb /> Hints
          </button>
          <button
                    className={`tab ${activeTab === 'discussion' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussion')}
          >
                    <FaComments /> Discussion
          </button>
                </div>

                <div className="tab-content">
                  {activeTab === 'problem' && (
                    <div className="problem-description">
                      <p>{currentProblem?.description || problemDetails[currentProblem?.title]?.description || 'No description available'}</p>

                      {(currentProblem?.inputFormat || problemDetails[currentProblem?.title]?.inputFormat) && (
                        <div className="problem-section">
                          <h4>Input Format</h4>
                          <p>{currentProblem?.inputFormat || problemDetails[currentProblem?.title]?.inputFormat}</p>
        </div>
                      )}
                      
                      {(currentProblem?.outputFormat || problemDetails[currentProblem?.title]?.outputFormat) && (
                        <div className="problem-section">
                          <h4>Output Format</h4>
                          <p>{currentProblem?.outputFormat || problemDetails[currentProblem?.title]?.outputFormat}</p>
              </div>
                      )}
                      
                      {(currentProblem?.constraints || problemDetails[currentProblem?.title]?.constraints) && (
                        <div className="problem-section">
                          <h4>Constraints</h4>
                          <p>{currentProblem?.constraints || problemDetails[currentProblem?.title]?.constraints}</p>
              </div>
                      )}
                      
                      <h4>Example Test Cases:</h4>
                      {(currentProblem?.examples || 
                        problemDetails[currentProblem?.title]?.examples || 
                        []).map((example, index) => (
                        <div key={index} className="example-case">
                    <div className="example-input">
                            <strong>Input:</strong> {example?.input}
                    </div>
                    <div className="example-output">
                            <strong>Output:</strong> {example?.output}
                    </div>
                          {example?.explanation && (
                      <div className="example-explanation">
                        <strong>Explanation:</strong> {example.explanation}
                      </div>
                    )}
                  </div>
                      )) || <div>No examples available</div>}
              </div>
                  )}

                  {activeTab === 'submissions' && (
                    <div className="submissions-list">
                      {problemSubmissions.length > 0 ? (
                        problemSubmissions.map((submission, index) => (
                          <div key={index} className="submission-item">
                            <div className="submission-header">
                              <span className={`status ${submission.status.toLowerCase()}`}>
                                {submission.status}
                              </span>
                              <span className="submission-date">
                                {formatTime(submission.timestamp)}
                              </span>
                            </div>
                            <div className="submission-details">
                              <span>Language: {submission.language}</span>
                              <span>Runtime: {submission.runtime}ms</span>
                              <span>Memory: {submission.memory}MB</span>
                              <button 
                                className="view-code-btn"
                                onClick={() => handleViewSubmission(submission)}
                              >
                                <FaEye /> View Code
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-submissions">
                          <p>You haven't submitted any solutions yet.</p>
                          <button 
                            className="primary-btn"
                            onClick={() => setActiveTab('problem')}
                          >
                            Go back to problem
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'hints' && (
                    <div className="hints-section">
                      {/* Built-in hints */}
                      {currentProblem.hints && currentProblem.hints.length > 0 && (
                        <>
                          <h4>Problem Hints</h4>
                    {currentProblem.hints.map((hint, index) => (
                            <div key={index} className="hint-item">
                              <button
                                className="hint-toggle"
                                onClick={() => setShowHint(index)}
                              >
                                Hint {index + 1}
                              </button>
                              {showHint === index && <p className="hint-content">{hint}</p>}
                            </div>
                          ))}
                        </>
                      )}
                      
                      {/* Gemini-generated hints */}
                      {geminiHints.length > 0 && (
                        <div className="gemini-hints">
                          <h4>AI-Generated Hints</h4>
                          {geminiHints.map((hint, index) => (
                            <div key={`gemini-${index}`} className="hint-item ai-hint">
                              <div className="hint-header">
                                <FaRobot /> AI Hint {index + 1}
                              </div>
                              <p className="hint-content">{hint}</p>
                            </div>
                          ))}
                </div>
              )}

                      <div className="generate-hint-container">
                        <button 
                          className="generate-hint-btn"
                          onClick={generateGeminiHint}
                          disabled={loadingHints}
                        >
                          {loadingHints ? (
                            <>Generating Hint...</>
                          ) : (
                            <><FaRobot /> Generate AI Hint</>
                          )}
                        </button>
                    </div>
                    </div>
                  )}

                  {activeTab === 'discussion' && (
                    <div className="discussion-section">
                      <div className="discussion-header">
                        <h3>Community Discussion</h3>
                        <button className="post-btn"><FaComments /> Post a Comment</button>
                      </div>
                      
                      {communityFeatures.discussions.length > 0 ? (
                        <div className="discussion-threads">
                          {communityFeatures.discussions.map((discussion, index) => (
                            <div key={index} className="discussion-item">
                              <div className="discussion-header">
                                <span className="author">{discussion.author}</span>
                                <span className="time">{formatTime(discussion.timestamp)}</span>
                              </div>
                              <p className="content">{discussion.content}</p>
                  </div>
                ))}
              </div>
                      ) : (
                        <div className="no-discussions">
                          <p>No discussions yet. Be the first to start a conversation!</p>
                        </div>
                      )}
                    </div>
                  )}
        </div>
      </div>

              {/* Code Editor Section */}
              <div className="code-editor-section">
                <div className="editor-header">
          <select 
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="language-selector"
                  >
                    {supportedLanguages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
            ))}
          </select>

                  <div className="editor-settings">
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="theme-selector"
                    >
                      <option value="vs-dark">Dark</option>
                      <option value="light">Light</option>
                    </select>

                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      min="12"
                      max="20"
                      className="font-size-input"
                    />
                  </div>
                </div>

                <Editor
                  height="400px"
                  language={selectedLanguage}
                  value={editorValue}
                  theme={theme}
                  onChange={setEditorValue}
                  onMount={handleEditorDidMount}
                  options={{
                    fontSize: fontSize,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true
                  }}
                />

                <div className="editor-footer">
                  <div className="editor-actions-left">
                    <button
                      className="run-tests-btn"
                      onClick={() => handleRunTest(currentProblem?.examples?.[0])}
                      disabled={isLoading || submitting}
                    >
                      <FaPlay /> Run Test
          </button>
                    <button
                      className="submit-btn"
                      onClick={handleSubmitCode}
                      disabled={isLoading || submitting}
                    >
                      <FaCheck /> Submit
          </button>
                  </div>
                  <div className="editor-actions-right">
                    <button
                      className="ai-analyze-btn"
                      onClick={() => analyzeCodeWithGemini('analyze')}
                      disabled={!aiAnalysisEnabled || aiLoading || isLoading}
                    >
                      <FaRobot /> Analyze Code
          </button>
          <button 
                      className="ai-help-btn"
                      onClick={() => generateGeminiHint()}
                      disabled={loadingHints || isLoading}
          >
                      <FaLightbulb /> Get Hint
          </button>
                  </div>
          </div>

                {/* Console Output */}
                {consoleOutput.length > 0 && (
                  <div className="console-output">
                    <div className="console-header">
                      <h4>Console Output</h4>
          <button 
                        className="clear-console-btn"
                        onClick={() => setConsoleOutput([])}
          >
                        Clear
          </button>
            </div>
                    <div className="console-content">
                      {consoleOutput.map((output, index) => (
                        <div key={index} className={`console-line ${output.type}`}>
                          {output.message}
                        </div>
                      ))}
            </div>
            </div>
                )}

                {/* Test Results */}
                {testResults.length > 0 && (
                  <div className="test-results">
                    <h4>Test Results</h4>
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`test-case-result ${result.passed ? 'passed' : 'failed'}`}
                      >
                        <span className="result-icon">
                          {result.passed ? <FaCheck /> : <FaTimes />}
                        </span>
                        <span className="test-case-name">Test Case {index + 1}</span>
                        {!result.passed && (
                          <div className="error-message">{result.error}</div>
          )}
          </div>
                    ))}
                  </div>
                )}
        </div>

              {/* AI Helper Panels */}
              {showAIHelper && (
                <div className="ai-helper-panel">
                  <div className="ai-panel-header">
                    <h3>
                      <FaRobot /> 
                      {aiAnalysisMode === 'analyze' ? 'Code Analysis' : 'Concept Explanation'}
                    </h3>
                    <button onClick={() => setShowAIHelper(false)}>×</button>
                  </div>
                  
                  <div className="ai-content">
                    {aiLoading ? (
                      <div className="ai-loading">
                        <p>AI is analyzing your code...</p>
                      </div>
                    ) : aiResponse ? (
                      <div className="ai-response">
                        {aiResponse.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    ) : (
                      <div className="ai-suggestions">
                        {aiSuggestions.map((suggestion, index) => (
                          <div key={index} className="suggestion-item">
                            <FaLightbulb className="suggestion-icon" />
                            <p>{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {codeAnalysis && (
                      <div className="performance-analysis">
                        <h4>Performance Analysis</h4>
                        <div className="metrics">
                          <div className="metric">
                            <span>Efficiency</span>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ 
                                  width: `${codeAnalysis.performance.efficiency * 100}%`,
                                  backgroundColor: getPerformanceColor(codeAnalysis.performance.efficiency)
                                }}
                              />
                            </div>
                          </div>
                          <div className="metric">
                            <span>Readability</span>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ 
                                  width: `${codeAnalysis.performance.readability * 100}%`,
                                  backgroundColor: getPerformanceColor(codeAnalysis.performance.readability)
                                }}
                              />
                            </div>
                          </div>
                          <div className="metric">
                            <span>Optimization</span>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ 
                                  width: `${codeAnalysis.performance.optimization * 100}%`,
                                  backgroundColor: getPerformanceColor(codeAnalysis.performance.optimization)
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Algorithm Visualization Panel */}
              {showVisualization && algorithmVisualization && (
                <div className="visualization-panel">
                  <div className="visualization-header">
                    <h3><FaChartBar /> Algorithm Visualization</h3>
                    <button onClick={() => setShowVisualization(false)}>×</button>
                  </div>
                  <div className="visualization-content">
                    {algorithmVisualization.steps.map((step, index) => (
                      <div key={index} className="visualization-step">
                        <div className="step-number">{index + 1}</div>
                        <div className="step-content">
                          <p>{step.description}</p>
                          {step.visual && (
                            <div className="step-visual" dangerouslySetInnerHTML={{ __html: step.visual }} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-problem-selected">
              <h3>Select a problem to start coding</h3>
              <p>Choose from the list of problems or let our AI recommend one for you.</p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="error-message-global">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && (
        <div className="quiz-modal">
          <div className="quiz-content">
            <div className="quiz-header">
              <h3>Concept Check Quiz</h3>
              <button onClick={() => setShowQuiz(false)}>×</button>
            </div>
            
            <div className="quiz-body">
              {quizQuestions.map((question, index) => (
                <div key={index} className="quiz-question">
                  <p>{question.question}</p>
                  <div className="quiz-options">
                    {question.options.map((option, optIndex) => (
                      <label key={optIndex} className="quiz-option">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={optIndex}
                          checked={quizAnswers[index] === optIndex}
                          onChange={() => {
                            setQuizAnswers({
                              ...quizAnswers,
                              [index]: optIndex
                            });
                          }}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
        </div>

            <div className="quiz-footer">
              <button onClick={() => setShowQuiz(false)} className="cancel-btn">Close</button>
              <button
                onClick={() => {
                  // Handle quiz submission
                  setShowQuiz(false);
                }}
                className="submit-quiz-btn"
              >
                Submit Answers
              </button>
        </div>
      </div>
    </div>
      )}

      {/* Submission Code Modal */}
      {showSubmissionModal && selectedSubmission && (
        <div className="modal-overlay">
          <div className="submission-modal">
            <div className="modal-header">
              <h3>Submission Details</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowSubmissionModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="submission-info">
                <div className="submission-info-item">
                  <span>Problem:</span> {selectedSubmission.problemTitle}
                </div>
                <div className="submission-info-item">
                  <span>Status:</span> 
                  <span className={`status ${selectedSubmission.status.toLowerCase()}`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                <div className="submission-info-item">
                  <span>Submitted:</span> {formatTime(selectedSubmission.timestamp)}
                </div>
                <div className="submission-info-item">
                  <span>Language:</span> {selectedSubmission.language}
                </div>
                <div className="submission-info-item">
                  <span>Runtime:</span> {selectedSubmission.runtime}ms
                </div>
                <div className="submission-info-item">
                  <span>Memory:</span> {selectedSubmission.memory}MB
                </div>
              </div>
              
              <div className="submission-code">
                <h4>Submitted Code</h4>
                <div className="code-view">
                  <pre>{selectedSubmission.code}</pre>
                </div>
              </div>
              
              {selectedSubmission.testResults && selectedSubmission.testResults.length > 0 && (
                <div className="submission-test-results">
                  <h4>Test Results</h4>
                  {selectedSubmission.testResults.map((result, index) => (
                    <div 
                      key={index}
                      className={`test-result-item ${result.passed ? 'passed' : 'failed'}`}
                    >
                      <div className="test-result-header">
                        <span className="test-result-icon">
                          {result.passed ? <FaCheck /> : <FaTimes />}
                        </span>
                        <span>Test Case {index + 1}</span>
                      </div>
                      
                      {!result.passed && result.error && (
                        <div className="test-error">{result.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Practice;
