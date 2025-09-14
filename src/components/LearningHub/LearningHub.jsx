import { useState, useEffect } from 'react';
import { 
  FaCode, FaLightbulb, FaBook, FaVideo, FaTrophy, FaChalkboardTeacher, 
  FaCalendarAlt, FaListAlt, FaCogs, FaYoutube, FaBookmark, FaCheckCircle,
  FaArrowRight, FaArrowLeft, FaPencilAlt, FaPlus, FaTimes, FaDatabase, FaBrain
} from 'react-icons/fa';
import './LearningHub.css';

const LearningHub = () => {
  const [activeTab, setActiveTab] = useState('paths');
  const [selectedPath, setSelectedPath] = useState(null);
  const [activeTutorial, setActiveTutorial] = useState(null);
  const [userSkillLevel, setUserSkillLevel] = useState('intermediate');
  const [customizingPath, setCustomizingPath] = useState(false);
  const [bookmarkedTutorials, setBookmarkedTutorials] = useState([]);
  const [tutorialFilter, setTutorialFilter] = useState('all');
  const [videoDuration, setVideoDuration] = useState('any');
  const [videoResults, setVideoResults] = useState([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [tutorialProgress, setTutorialProgress] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom path state variables
  const [showCustomPathModal, setShowCustomPathModal] = useState(false);
  const [customPath, setCustomPath] = useState({
    topic: 'data-structures',
    duration: '4 weeks'
  });

  const YOUTUBE_API_KEY = 'AIzaSyDRPXziVhkgLOip4hgipVmiJjWhPNWjNC0';

  // Topics for custom path
  const pathTopics = [
    { id: 'data-structures', name: 'Data Structures & Algorithms' },
    { id: 'web-dev', name: 'Web Development' },
    { id: 'mobile-dev', name: 'Mobile Development' },
    { id: 'database', name: 'Databases' },
    { id: 'machine-learning', name: 'Machine Learning' },
    { id: 'devops', name: 'DevOps' }
  ];

  // Levels for custom path
  const pathLevels = [
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  // Durations for custom path
  const pathDurations = [
    { id: '2 weeks', name: '2 weeks' },
    { id: '4 weeks', name: '4 weeks' },
    { id: '8 weeks', name: '8 weeks' },
    { id: '12 weeks', name: '12 weeks' }
  ];

  // Personalized learning paths
  const learningPaths = [
    {
      id: 1,
      title: 'Data Structures & Algorithms',
      level: 'Beginner to Intermediate',
      duration: '8 weeks',
      description: 'Master the fundamentals of data structures and algorithms, essential for coding interviews and problem solving.',
      icon: <FaCode />,
      weeks: [
        {
          weekNumber: 1,
          summary: 'Introduction to fundamental data structures and time complexity analysis.',
          days: [
            {
              day: 'Monday',
              topic: 'Introduction to Arrays',
              problems: [
                { title: 'Two Sum', difficulty: 'Easy', platform: 'LeetCode' },
                { title: 'Contains Duplicate', difficulty: 'Easy', platform: 'LeetCode' }
              ]
            },
            {
              day: 'Tuesday',
              topic: 'Array Operations',
              problems: [
                { title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', platform: 'LeetCode' },
                { title: 'Rotate Array', difficulty: 'Medium', platform: 'LeetCode' }
              ]
            },
            {
              day: 'Wednesday',
              topic: 'Introduction to Strings',
              problems: [
                { title: 'Valid Anagram', difficulty: 'Easy', platform: 'LeetCode' },
                { title: 'Valid Palindrome', difficulty: 'Easy', platform: 'LeetCode' }
              ]
            },
            {
              day: 'Thursday',
              topic: 'String Manipulation',
              problems: [
                { title: 'Reverse String', difficulty: 'Easy', platform: 'LeetCode' },
                { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', platform: 'LeetCode' }
              ]
            },
            {
              day: 'Friday',
              topic: 'Time Complexity Analysis',
              problems: [
                { title: 'Maximum Subarray', difficulty: 'Easy', platform: 'LeetCode' },
                { title: 'Move Zeroes', difficulty: 'Easy', platform: 'LeetCode' }
              ]
            },
            {
              day: 'Saturday',
              topic: 'Weekly Challenge',
              problems: [
                { title: 'Product of Array Except Self', difficulty: 'Medium', platform: 'LeetCode' }
              ]
            },
            {
              day: 'Sunday',
              topic: 'Review Day',
              description: 'Review concepts learned this week and revisit any challenging problems.'
            }
          ]
        },
        {
          weekNumber: 2,
          summary: 'Stacks, Queues and Linked Lists fundamentals.',
          days: [
            {
              day: 'Monday',
              topic: 'Stacks',
              problems: [
                { title: 'Valid Parentheses', difficulty: 'Easy', platform: 'LeetCode' },
                { title: 'Min Stack', difficulty: 'Medium', platform: 'LeetCode' }
              ]
            },
            {
              day: 'Tuesday',
              topic: 'Queue Implementation',
              problems: [
                { title: 'Implement Queue using Stacks', difficulty: 'Easy', platform: 'LeetCode' },
                { title: 'Design Circular Queue', difficulty: 'Medium', platform: 'LeetCode' }
              ]
            },
            {
              day: 'Wednesday',
              topic: 'Linked Lists Basics',
              problems: [
                { title: 'Reverse Linked List', difficulty: 'Easy', platform: 'LeetCode' },
                { title: 'Delete Node in a Linked List', difficulty: 'Easy', platform: 'LeetCode' }
              ]
            },
            {
              day: 'Thursday',
              topic: 'Linked List Operations',
              problems: [
                { title: 'Merge Two Sorted Lists', difficulty: 'Easy', platform: 'LeetCode' },
                { title: 'Remove Nth Node From End of List', difficulty: 'Medium', platform: 'LeetCode' }
              ]
            },
            {
              day: 'Friday',
              topic: 'Checkpoint: Week 1-2 Review',
              description: 'Review all concepts covered in weeks 1-2 and complete assessment quiz.'
            },
            {
              day: 'Saturday',
              topic: 'Mock Interview',
              description: 'Practice with a set of interview-style questions covering arrays, strings, stacks, queues, and linked lists.'
            },
            {
              day: 'Sunday',
              topic: 'Bonus Challenges',
              problems: [
                { title: 'LRU Cache', difficulty: 'Medium', platform: 'LeetCode' },
                { title: 'Palindrome Linked List', difficulty: 'Easy', platform: 'LeetCode' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Web Development Fundamentals',
      level: 'Beginner',
      duration: '6 weeks',
      description: 'Build a strong foundation in HTML, CSS, and JavaScript for modern web development.',
      icon: <FaLightbulb />,
      weeks: [
        {
          weekNumber: 1,
          summary: 'HTML foundations and document structure.',
          days: [
            {
              day: 'Monday',
              topic: 'HTML Basics',
              description: 'Learn about HTML tags, elements, and document structure.'
            },
            {
              day: 'Tuesday',
              topic: 'Text Elements & Lists',
              description: 'Work with headings, paragraphs, lists, and text formatting.'
            },
            {
              day: 'Wednesday',
              topic: 'HTML Links & Images',
              description: 'Implementation of hyperlinks and embedding images.'
            },
            {
              day: 'Thursday',
              topic: 'HTML Tables',
              description: 'Create and style tables for data presentation.'
            },
            {
              day: 'Friday',
              topic: 'HTML Forms',
              description: 'Build interactive forms with various input types.'
            },
            {
              day: 'Saturday',
              topic: 'Project: Personal Profile Page',
              description: 'Create a simple profile page using HTML elements learned.'
            },
            {
              day: 'Sunday',
              topic: 'Review & Reflection',
              description: 'Review the week\'s concepts and plan for next week.'
            }
          ]
        },
        {
          weekNumber: 2,
          summary: 'CSS styling and layout techniques.',
          days: [
            {
              day: 'Monday',
              topic: 'CSS Basics',
              description: 'Introduction to selectors, properties, and values.'
            },
            {
              day: 'Tuesday',
              topic: 'Colors & Typography',
              description: 'Working with fonts, colors, and text styling.'
            },
            {
              day: 'Wednesday',
              topic: 'Box Model',
              description: 'Understanding padding, borders, margin, and box-sizing.'
            },
            {
              day: 'Thursday',
              topic: 'CSS Layout Basics',
              description: 'Using display, position, and float properties.'
            },
            {
              day: 'Friday',
              topic: 'Flexbox',
              description: 'Creating flexible layouts with Flexbox.'
            },
            {
              day: 'Saturday',
              topic: 'Project: Styled Profile Page',
              description: 'Apply CSS to style the profile page created in week 1.'
            },
            {
              day: 'Sunday',
              topic: 'Checkpoint: Weeks 1-2 Review',
              description: 'Review HTML and CSS fundamentals with practice exercises.'
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Advanced JavaScript',
      level: 'Intermediate to Advanced',
      duration: '6 weeks',
      description: 'Deepen your JavaScript skills with advanced concepts like closures, prototypes, async programming, and modern ES6+ features.',
      icon: <FaCode />,
      weeks: [
        {
          weekNumber: 1,
          summary: 'Advanced JavaScript fundamentals and ES6+ features.',
          days: [
            {
              day: 'Monday',
              topic: 'ES6+ Features Overview',
              description: 'Introduction to modern JavaScript features and syntax improvements.'
            },
            {
              day: 'Tuesday',
              topic: 'Arrow Functions & Lexical Scope',
              description: 'Understanding arrow functions and their behavior with this keyword.'
            }
          ]
        }
      ]
    },
    {
      id: 4,
      title: 'React Mastery',
      level: 'Intermediate',
      duration: '8 weeks',
      description: 'Build powerful, interactive web applications with React. Learn hooks, context API, state management, and more.',
      icon: <FaLightbulb />,
      weeks: [
        {
          weekNumber: 1,
          summary: 'React fundamentals and component architecture.',
          days: [
            {
              day: 'Monday',
              topic: 'React Component Patterns',
              description: 'Learn about different component patterns in React applications.'
            }
          ]
        }
      ]
    },
    {
      id: 5,
      title: 'Full Stack Development with MERN',
      level: 'Intermediate to Advanced',
      duration: '10 weeks',
      description: 'Build complete web applications using MongoDB, Express, React, and Node.js (MERN stack).',
      icon: <FaDatabase />,
      weeks: [
        {
          weekNumber: 1,
          summary: 'Introduction to the MERN stack architecture.',
          days: [
            {
              day: 'Monday',
              topic: 'MERN Stack Overview',
              description: 'Introduction to the components of the MERN stack and how they work together.'
            }
          ]
        }
      ]
    },
    {
      id: 6,
      title: 'Machine Learning Fundamentals',
      level: 'Intermediate',
      duration: '12 weeks',
      description: 'Learn the basics of machine learning algorithms, data preprocessing, and model evaluation using Python.',
      icon: <FaBrain />,
      weeks: [
        {
          weekNumber: 1,
          summary: 'Introduction to machine learning concepts and Python libraries.',
          days: [
            {
              day: 'Monday',
              topic: 'Introduction to ML',
              description: 'Overview of machine learning concepts, types, and applications.'
            }
          ]
        }
      ]
    },
    {
      id: 7,
      title: 'DevOps & CI/CD Pipelines',
      level: 'Intermediate to Advanced',
      duration: '8 weeks',
      description: 'Master DevOps practices including containerization, CI/CD pipelines, and cloud infrastructure management.',
      icon: <FaCogs />,
      weeks: [
        {
          weekNumber: 1,
          summary: 'Introduction to DevOps principles and practices.',
          days: [
            {
              day: 'Monday',
              topic: 'DevOps Philosophy',
              description: 'Understanding the culture, principles, and benefits of DevOps.'
            }
          ]
        }
      ]
    }
  ];

  const handleCustomPathChange = (e) => {
    const { name, value } = e.target;
    setCustomPath(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createCustomPath = () => {
    // Generate a new ID for the custom path
    const newId = learningPaths.length + 1;
    
    // Get the icon based on topic
    let icon = <FaCode />;
    if (customPath.topic === 'web-dev') icon = <FaLightbulb />;
    else if (customPath.topic === 'database') icon = <FaDatabase />;
    else if (customPath.topic === 'machine-learning') icon = <FaBrain />;
    else if (customPath.topic === 'devops') icon = <FaCogs />;
    
    // Get topic name
    const topicName = pathTopics.find(t => t.id === customPath.topic).name;
    
    // Create a basic template for the new path
    const newPath = {
      id: newId,
      title: `Custom ${topicName} Path`,
      level: 'Customized',
      duration: customPath.duration,
      description: `Your personalized learning path for ${topicName}`,
      icon: icon,
      custom: true,
      weeks: []
    };
    
    // Select the new path
    setSelectedPath(newPath);
    
    // Close the modal
    setShowCustomPathModal(false);
  };

  // Tutorial categories
  const tutorialCategories = [
    { id: 'all', name: 'All Tutorials' },
    { id: 'algorithms', name: 'Algorithms' },
    { id: 'data-structures', name: 'Data Structures' },
    { id: 'web-dev', name: 'Web Development' },
    { id: 'database', name: 'Databases' },
    { id: 'mobile', name: 'Mobile Development' }
  ];

  // Tutorials data
  const tutorials = [
    {
      id: 1,
      title: 'Mastering Array Methods',
      category: 'data-structures',
      type: 'Text & Code',
      skillLevel: 'beginner',
      duration: '45 min',
      author: 'Sarah Johnson',
      description: 'Learn how to effectively use array methods for data manipulation.',
      icon: <FaCode />,
      sections: [
        {
          title: 'Introduction to Arrays',
          content: 'Arrays are ordered collections of data that allow you to store multiple values in a single variable. They are fundamental data structures in programming and are used to store and organize data efficiently.',
          code: 'const fruits = ["Apple", "Banana", "Orange"];'
        },
        {
          title: 'Basic Array Operations',
          content: 'Learn how to add, remove, and modify elements in an array using methods like push(), pop(), shift(), and unshift().',
          code: 'fruits.push("Mango"); // Add to end\nfruits.pop(); // Remove from end\nfruits.unshift("Strawberry"); // Add to beginning\nfruits.shift(); // Remove from beginning'
        },
        {
          title: 'Array Iteration Methods',
          content: 'Modern JavaScript provides powerful methods for iterating over arrays, such as forEach(), map(), filter(), and reduce().',
          code: 'fruits.forEach(fruit => console.log(fruit));\nconst upperFruits = fruits.map(fruit => fruit.toUpperCase());\nconst longFruits = fruits.filter(fruit => fruit.length > 5);'
        }
      ],
      relatedTopics: ['Data Structures', 'JavaScript', 'Algorithms']
    },
    {
      id: 2,
      title: 'Introduction to React Hooks',
      category: 'web-dev',
      type: 'Interactive',
      skillLevel: 'intermediate',
      duration: '90 min',
      author: 'Michael Chen',
      description: 'Get started with React Hooks to manage state and side effects in functional components.',
      icon: <FaChalkboardTeacher />,
      sections: [
        {
          title: 'Why React Hooks?',
          content: 'React Hooks were introduced in React 16.8 to allow you to use state and other React features without writing a class component. They simplify component logic and avoid the confusion of this keyword and binding event handlers.'
        },
        {
          title: 'useState Hook',
          content: 'The useState hook allows you to add state to your functional components. It returns the current state value and a function to update it.',
          code: 'import React, { useState } from "react";\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}'
        },
        {
          title: 'useEffect Hook',
          content: 'The useEffect hook lets you perform side effects in functional components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount in React classes.',
          code: 'import React, { useState, useEffect } from "react";\n\nfunction Example() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    document.title = `You clicked ${count} times`;\n    \n    return () => {\n      // Cleanup function (like componentWillUnmount)\n    };\n  }, [count]); // Only re-run if count changes\n\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}'
        }
      ],
      relatedTopics: ['React', 'JavaScript', 'Web Development', 'Frontend']
    },
    {
      id: 3,
      title: 'Graph Algorithms for Beginners',
      category: 'algorithms',
      type: 'Text & Video',
      skillLevel: 'intermediate',
      duration: '60 min',
      author: 'Alex Rivera',
      description: 'Learn the basics of graph theory and essential graph algorithms.',
      icon: <FaLightbulb />,
      sections: [
        {
          title: 'Introduction to Graphs',
          content: 'Graphs are a collection of nodes (vertices) connected by edges. They represent relationships between different entities and are widely used in computer science and real-world applications.'
        },
        {
          title: 'Graph Representation',
          content: 'Graphs can be represented using adjacency matrices or adjacency lists. Each approach has different space and time complexity implications.',
          code: '// Adjacency List representation\nconst graph = {\n  A: ["B", "C"],\n  B: ["A", "D", "E"],\n  C: ["A", "F"],\n  D: ["B"],\n  E: ["B", "F"],\n  F: ["C", "E"]\n};'
        },
        {
          title: 'Breadth-First Search (BFS)',
          content: 'BFS is an algorithm for traversing or searching tree or graph data structures. It starts at a chosen node and explores all neighboring nodes at the present depth before moving on to nodes at the next depth level.',
          code: 'function bfs(graph, start) {\n  const visited = new Set();\n  const queue = [start];\n  visited.add(start);\n  \n  while (queue.length > 0) {\n    const vertex = queue.shift();\n    console.log(vertex);\n    \n    for (const neighbor of graph[vertex]) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n}'
        }
      ],
      relatedTopics: ['Algorithms', 'Data Structures', 'BFS', 'DFS', 'Shortest Path']
    },
    {
      id: 4,
      title: 'Building RESTful APIs with Node.js',
      category: 'web-dev',
      type: 'Text & Code',
      skillLevel: 'intermediate',
      duration: '120 min',
      author: 'Emily Parker',
      description: 'Learn to create scalable and secure REST APIs using Node.js and Express.',
      icon: <FaDatabase />,
      sections: [
        {
          title: 'Introduction to REST Architecture',
          content: 'REST (Representational State Transfer) is an architectural style for designing networked applications. Learn the principles and constraints of RESTful design.'
        },
        {
          title: 'Setting up Express.js',
          content: 'Create a basic API structure using Express.js framework for Node.js.',
          code: 'const express = require("express");\nconst app = express();\n\napp.use(express.json());\n\napp.get("/api/users", (req, res) => {\n  res.json([{ id: 1, name: "User 1" }, { id: 2, name: "User 2" }]);\n});\n\napp.listen(3000, () => console.log("Server running on port 3000"));'
        },
        {
          title: 'Implementing CRUD Operations',
          content: 'Create routes for Create, Read, Update, and Delete operations on your API resources.',
          code: 'app.post("/api/users", (req, res) => {\n  // Create new user\n  const user = { id: users.length + 1, ...req.body };\n  users.push(user);\n  res.status(201).json(user);\n});\n\napp.put("/api/users/:id", (req, res) => {\n  // Update user\n  const id = parseInt(req.params.id);\n  const userIndex = users.findIndex(u => u.id === id);\n  if (userIndex === -1) return res.status(404).send("User not found");\n  \n  users[userIndex] = { ...users[userIndex], ...req.body };\n  res.json(users[userIndex]);\n});'
        }
      ],
      relatedTopics: ['Node.js', 'Express', 'API Design', 'Backend', 'JavaScript']
    },
    {
      id: 5,
      title: 'Introduction to TypeScript',
      category: 'web-dev',
      type: 'Interactive',
      skillLevel: 'beginner',
      duration: '75 min',
      author: 'Jason Torres',
      description: 'Get started with TypeScript to build type-safe JavaScript applications.',
      icon: <FaCode />,
      sections: [
        {
          title: 'Why TypeScript?',
          content: 'Understand the benefits of TypeScript over plain JavaScript, including static typing, better IDE support, and improved code quality.'
        },
        {
          title: 'Basic Types and Interfaces',
          content: 'Learn about TypeScript\'s type system including primitive types, arrays, objects, and custom interfaces.',
          code: 'let isDone: boolean = false;\nlet count: number = 10;\nlet name: string = "John";\n\ninterface User {\n  id: number;\n  name: string;\n  email?: string; // Optional property\n}\n\nconst user: User = {\n  id: 1,\n  name: "John Doe"\n};'
        },
        {
          title: 'Functions and Type Assertions',
          content: 'Define typed functions, parameters, and return values. Learn about type assertions when working with complex types.',
          code: 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n\n// Function types\ntype OperationFn = (a: number, b: number) => number;\n\nconst add: OperationFn = (a, b) => a + b;\nconst subtract: OperationFn = (a, b) => a - b;'
        }
      ],
      relatedTopics: ['TypeScript', 'JavaScript', 'Web Development', 'Static Typing']
    },
    {
      id: 6,
      title: 'Mastering CSS Grid Layout',
      category: 'web-dev',
      type: 'Text & Interactive',
      skillLevel: 'intermediate',
      duration: '60 min',
      author: 'Lisa Wong',
      description: 'Learn how to create complex and responsive layouts using CSS Grid.',
      icon: <FaChalkboardTeacher />,
      sections: [
        {
          title: 'Grid Fundamentals',
          content: 'Understand the basic concepts of CSS Grid, including grid containers, grid items, grid lines, and grid tracks.',
          code: '.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-template-rows: 100px 200px;\n  gap: 20px;\n}'
        },
        {
          title: 'Grid Placement Properties',
          content: 'Learn how to place items precisely on the grid using properties like grid-column, grid-row, and grid-area.',
          code: '.item1 {\n  grid-column: 1 / 3; /* Start at line 1, end at line 3 */\n  grid-row: 1 / 2;    /* Start at line 1, end at line 2 */\n}\n\n.item2 {\n  grid-column: 3;\n  grid-row: 1 / span 2; /* Span 2 rows */\n}'
        },
        {
          title: 'Responsive Grid Layouts',
          content: 'Create adaptive grid layouts using minmax(), auto-fill/auto-fit, and media queries.',
          code: '.responsive-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 20px;\n}'
        }
      ],
      relatedTopics: ['CSS', 'Web Development', 'Responsive Design', 'Layout']
    },
    {
      id: 7,
      title: 'SQL Database Fundamentals',
      category: 'database',
      type: 'Text & Examples',
      skillLevel: 'beginner',
      duration: '90 min',
      author: 'David Clark',
      description: 'Learn the basics of relational databases and SQL query language.',
      icon: <FaDatabase />,
      sections: [
        {
          title: 'Introduction to Relational Databases',
          content: 'Understand database concepts including tables, relationships, keys, and normalization.'
        },
        {
          title: 'Basic SQL Queries',
          content: 'Learn how to retrieve data using SELECT queries with filtering, sorting, and limiting results.',
          code: 'SELECT first_name, last_name, email\nFROM customers\nWHERE country = "USA"\nORDER BY last_name ASC\nLIMIT 20;'
        },
        {
          title: 'Joining Tables',
          content: 'Master the art of combining data from multiple tables using INNER, LEFT, RIGHT, and FULL joins.',
          code: 'SELECT o.order_id, c.customer_name, p.product_name\nFROM orders o\nINNER JOIN customers c ON o.customer_id = c.customer_id\nINNER JOIN products p ON o.product_id = p.product_id\nWHERE o.order_date > "2023-01-01";'
        }
      ],
      relatedTopics: ['SQL', 'Databases', 'Data Management', 'Backend']
    },
    {
      id: 8,
      title: 'Mobile Development with React Native',
      category: 'mobile',
      type: 'Interactive',
      skillLevel: 'intermediate',
      duration: '120 min',
      author: 'Rachel Kim',
      description: 'Build cross-platform mobile apps using React Native and JavaScript.',
      icon: <FaLightbulb />,
      sections: [
        {
          title: 'Setting Up Your Environment',
          content: 'Configure your development environment for React Native with Expo or React Native CLI.'
        },
        {
          title: 'Building Your First Screen',
          content: 'Create a basic React Native component with text, images, and styling.',
          code: 'import React from "react";\nimport { View, Text, StyleSheet, Image } from "react-native";\n\nconst ProfileScreen = () => {\n  return (\n    <View style={styles.container}>\n      <Image\n        style={styles.avatar}\n        source={{ uri: "https://example.com/avatar.jpg" }}\n      />\n      <Text style={styles.name}>John Doe</Text>\n      <Text style={styles.bio}>React Native Developer</Text>\n    </View>\n  );\n};\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    alignItems: "center",\n    justifyContent: "center",\n  },\n  avatar: {\n    width: 100,\n    height: 100,\n    borderRadius: 50,\n  },\n  name: {\n    fontSize: 24,\n    fontWeight: "bold",\n    marginTop: 12,\n  },\n  bio: {\n    fontSize: 16,\n    color: "#666",\n    marginTop: 4,\n  },\n});'
        },
        {
          title: 'Navigation and State Management',
          content: 'Implement screen navigation and manage application state using React Navigation and Context API.',
          code: 'import { NavigationContainer } from "@react-navigation/native";\nimport { createStackNavigator } from "@react-navigation/stack";\n\nconst Stack = createStackNavigator();\n\nfunction App() {\n  return (\n    <NavigationContainer>\n      <Stack.Navigator>\n        <Stack.Screen name="Home" component={HomeScreen} />\n        <Stack.Screen name="Profile" component={ProfileScreen} />\n      </Stack.Navigator>\n    </NavigationContainer>\n  );\n}'
        }
      ],
      relatedTopics: ['React Native', 'JavaScript', 'Mobile Development', 'Cross-Platform']
    }
  ];

  // Fetch YouTube tutorials
  const fetchYouTubeTutorials = async (topic) => {
    if (!topic) return;
    
    setIsLoadingVideos(true);
    try {
      const query = `${topic} tutorial programming`;
      let durationParam = '';
      
      // Set duration parameter for the YouTube API
      if (videoDuration === 'short') {
        durationParam = '&videoDuration=short'; // Less than 4 minutes
      } else if (videoDuration === 'medium') {
        durationParam = '&videoDuration=medium'; // Between 4 and 20 minutes
      } else if (videoDuration === 'long') {
        durationParam = '&videoDuration=long'; // Longer than 20 minutes
      }
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&type=video${durationParam}&key=${YOUTUBE_API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      const data = await response.json();
      
      // Get video details (duration, view count)
      const videoIds = data.items.map(item => item.id.videoId).join(',');
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      
      // Combine search results with video details
      const videos = data.items.map(item => {
        const videoDetail = detailsData.items.find(detail => detail.id === item.id.videoId);
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
          duration: videoDetail ? formatDuration(videoDetail.contentDetails.duration) : 'Unknown',
          viewCount: videoDetail ? parseInt(videoDetail.statistics.viewCount).toLocaleString() : 'Unknown'
        };
      });
      
      setVideoResults(videos);
    } catch (error) {
      console.error('Error fetching YouTube tutorials:', error);
      // Provide some fallback data in case the API fails
      setVideoResults([
        {
          id: 'dQw4w9WgXcQ',
          title: `${topic} for Beginners - Tutorial`,
          thumbnail: 'https://via.placeholder.com/320x180.png?text=Tutorial+Thumbnail',
          channelTitle: 'Programming Made Simple',
          publishedAt: new Date().toLocaleDateString(),
          duration: '15:30',
          viewCount: '250,000'
        },
        {
          id: 'oHg5SJYRHA0',
          title: `Advanced ${topic} Concepts`,
          thumbnail: 'https://via.placeholder.com/320x180.png?text=Advanced+Tutorial',
          channelTitle: 'Code Masters',
          publishedAt: new Date().toLocaleDateString(),
          duration: '28:15',
          viewCount: '500,000'
        }
      ]);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Format YouTube duration from ISO 8601 to readable format
  const formatDuration = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] && match[1].replace('H', '')) || 0;
    const minutes = (match[2] && match[2].replace('M', '')) || 0;
    const seconds = (match[3] && match[3].replace('S', '')) || 0;
    
    return hours > 0 
      ? `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
      : `${minutes}:${seconds.padStart(2, '0')}`;
  };

  // Toggle tutorial bookmark
  const toggleBookmark = (tutorialId) => {
    setBookmarkedTutorials(prev => 
      prev.includes(tutorialId)
        ? prev.filter(id => id !== tutorialId)
        : [...prev, tutorialId]
    );
  };

  // Mark tutorial section as completed
  const markAsCompleted = (tutorialId, sectionIndex) => {
    setTutorialProgress(prev => ({
      ...prev,
      [tutorialId]: {
        ...(prev[tutorialId] || {}),
        [sectionIndex]: true
      }
    }));
  };

  // Calculate tutorial completion percentage
  const calculateProgress = (tutorialId) => {
    const tutorial = tutorials.find(t => t.id === tutorialId);
    if (!tutorial) return 0;
    
    const totalSections = tutorial.sections.length;
    const completedSections = Object.values(tutorialProgress[tutorialId] || {}).filter(Boolean).length;
    
    return Math.round((completedSections / totalSections) * 100);
  };

  // Render custom path modal
  const renderCustomPathModal = () => (
    <div className={`custom-path-modal ${showCustomPathModal ? 'show' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create Custom Learning Path</h3>
          <button className="close-btn" onClick={() => setShowCustomPathModal(false)}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="path-topic">Select Topic</label>
            <select 
              id="path-topic" 
              name="topic"
              value={customPath.topic}
              onChange={handleCustomPathChange}
            >
              {pathTopics.map(topic => (
                <option key={topic.id} value={topic.id}>{topic.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="path-duration">Select Duration</label>
            <select 
              id="path-duration" 
              name="duration"
              value={customPath.duration}
              onChange={handleCustomPathChange}
            >
              {pathDurations.map(duration => (
                <option key={duration.id} value={duration.id}>{duration.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="cancel-btn" onClick={() => setShowCustomPathModal(false)}>Cancel</button>
          <button className="create-btn" onClick={createCustomPath}>Create Path</button>
        </div>
      </div>
    </div>
  );

  // Render Learning Paths section
  const renderLearningPaths = () => (
    <div className="paths-section">
      {selectedPath ? (
        <div className="selected-path">
          <div className="selected-path-header">
            <button className="back-button" onClick={() => setSelectedPath(null)}>
              <FaArrowLeft /> Back to Paths
            </button>
            <h2>{selectedPath.title}</h2>
            <div className="path-actions">
              <button 
                className={`customize-btn ${customizingPath ? 'active' : ''}`}
                onClick={() => setCustomizingPath(!customizingPath)}
              >
                <FaPencilAlt /> {customizingPath ? 'Done Customizing' : 'Customize Path'}
              </button>
            </div>
          </div>
          
          <div className="path-overview">
            <div className="path-icon">{selectedPath.icon}</div>
            <div className="path-details">
              <p className="path-description">{selectedPath.description}</p>
              <div className="path-meta">
                <span><FaCalendarAlt /> {selectedPath.duration}</span>
                <span><FaListAlt /> {selectedPath.level}</span>
              </div>
            </div>
          </div>
          
          {selectedPath.custom && selectedPath.weeks.length === 0 ? (
            <div className="custom-path-empty">
              <h3>Your custom path is ready!</h3>
              <p>We're preparing personalized content based on your selections. Check back soon or click below to start customizing this path.</p>
              <button 
                className="customize-path-btn"
                onClick={() => setCustomizingPath(true)}
              >
                <FaPencilAlt /> Start Customizing
              </button>
            </div>
          ) : (
            <div className="learning-weeks">
              {selectedPath.weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="learning-week">
                  <div className="week-header">
                    <h3>Week {week.weekNumber}</h3>
                    <p className="week-summary">{week.summary}</p>
                  </div>
                  
                  <div className="week-days">
                    {week.days.map((day, dayIndex) => (
                      <div key={dayIndex} className="day-card">
                        <div className="day-header">
                          <h4>{day.day}</h4>
                          {customizingPath && (
                            <button className="edit-day-btn">
                              <FaPencilAlt />
                            </button>
                          )}
                        </div>
                        <div className="day-content">
                          <h5>{day.topic}</h5>
                          {day.description && <p>{day.description}</p>}
                          
                          {day.problems && day.problems.length > 0 && (
                            <div className="day-problems">
                              <h6>Recommended Problems:</h6>
                              <ul>
                                {day.problems.map((problem, probIndex) => (
                                  <li key={probIndex}>
                                    <span className="problem-title">{problem.title}</span>
                                    <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
                                      {problem.difficulty}
                                    </span>
                                    <span className="platform">{problem.platform}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Checkpoint indicator for every 2 weeks */}
                  {week.weekNumber % 2 === 0 && (
                    <div className="checkpoint">
                      <div className="checkpoint-icon">
                        <FaTrophy />
                      </div>
                      <div className="checkpoint-details">
                        <h4>Checkpoint: Weeks {week.weekNumber - 1}-{week.weekNumber}</h4>
                        <p>Time to review and assess your progress. Complete the checkpoint quiz and review any challenging concepts.</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="paths-header">
            <h2>Learning Paths</h2>
            <p>Choose a structured learning path based on your interests and goals</p>
            <button 
              className="create-path-btn"
              onClick={() => setShowCustomPathModal(true)}
            >
              <FaPlus /> Create Custom Path
            </button>
          </div>
          <div className="paths-grid">
            {learningPaths.map((path) => (
              <div 
                key={path.id} 
                className="path-card"
                onClick={() => setSelectedPath(path)}
              >
                <div className="path-header">
                  <div className="path-icon">{path.icon}</div>
                  <h3>{path.title}</h3>
                </div>
                <div className="path-level">{path.level}</div>
                <div className="path-meta">
                  <span>{path.duration}</span>
                  <span>{path.weeks ? `${path.weeks.length} weeks` : 'Flexible'}</span>
                </div>
                <p className="path-description">{path.description}</p>
                <button className="view-path-btn">View Path <FaArrowRight /></button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // Render Tutorials section
  const renderTutorials = () => (
    <div className="tutorials-section">
      <div className="tutorials-header">
        <h2>Step-by-Step Tutorials</h2>
        <div className="tutorials-filters">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search tutorials..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            onChange={(e) => setTutorialFilter(e.target.value)}
            value={tutorialFilter}
          >
            {tutorialCategories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <select 
            onChange={(e) => setUserSkillLevel(e.target.value)}
            value={userSkillLevel}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
      
      {activeTutorial ? (
        <div className="tutorial-detail">
          <div className="tutorial-detail-header">
            <button 
              className="back-to-tutorials" 
              onClick={() => setActiveTutorial(null)}
            >
              <FaArrowLeft /> Back to Tutorials
            </button>
            <h3>{tutorials.find(t => t.id === activeTutorial)?.title}</h3>
            <button 
              className={`bookmark-btn ${bookmarkedTutorials.includes(activeTutorial) ? 'active' : ''}`}
              onClick={() => toggleBookmark(activeTutorial)}
            >
              <FaBookmark /> {bookmarkedTutorials.includes(activeTutorial) ? 'Bookmarked' : 'Bookmark'}
            </button>
          </div>
          
          <div className="tutorial-content">
            <div className="tutorial-info">
              <div className="tutorial-meta">
                <span className="author">By {tutorials.find(t => t.id === activeTutorial)?.author}</span>
                <span className="type">{tutorials.find(t => t.id === activeTutorial)?.type}</span>
                <span className="duration">{tutorials.find(t => t.id === activeTutorial)?.duration}</span>
                <span className={`level ${tutorials.find(t => t.id === activeTutorial)?.skillLevel}`}>
                  {tutorials.find(t => t.id === activeTutorial)?.skillLevel.charAt(0).toUpperCase() + 
                   tutorials.find(t => t.id === activeTutorial)?.skillLevel.slice(1)}
                </span>
              </div>
              <p className="tutorial-description">
                {tutorials.find(t => t.id === activeTutorial)?.description}
              </p>
            </div>
            
            <div className="tutorial-sections">
              {tutorials.find(t => t.id === activeTutorial)?.sections.map((section, index) => {
                const isCompleted = tutorialProgress[activeTutorial]?.[index];
                
                return (
                  <div key={index} className={`section-card ${isCompleted ? 'completed' : ''}`}>
                    <div className="section-header">
                      <h4>{section.title}</h4>
                      <button 
                        className={`complete-btn ${isCompleted ? 'completed' : ''}`}
                        onClick={() => markAsCompleted(activeTutorial, index)}
                      >
                        {isCompleted ? <FaCheckCircle /> : 'Mark Complete'}
                      </button>
                    </div>
                    <div className="section-content">
                      <p>{section.content}</p>
                      {section.code && (
                        <div className="code-sample">
                          <pre><code>{section.code}</code></pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* YouTube video integration */}
            <div className="video-resources">
              <div className="video-header">
                <h3>Related Video Tutorials</h3>
                <div className="video-filters">
                  <select 
                    onChange={(e) => setVideoDuration(e.target.value)}
                    value={videoDuration}
                  >
                    <option value="any">Any Duration</option>
                    <option value="short">Short (less than 4 min)</option>
                    <option value="medium">Medium (4-20 min)</option>
                    <option value="long">Long (greater than 20 min)</option>
                  </select>
                  <button 
                    className="fetch-videos-btn"
                    onClick={() => fetchYouTubeTutorials(tutorials.find(t => t.id === activeTutorial)?.title)}
                    disabled={isLoadingVideos}
                  >
                    <FaYoutube /> Find Videos
                  </button>
                </div>
              </div>
              
              {isLoadingVideos ? (
                <div className="loading-videos">Loading video tutorials...</div>
              ) : (
                <div className="video-grid">
                  {videoResults.map(video => (
                    <div key={video.id} className="video-card">
                      <div className="video-thumbnail">
                        <img src={video.thumbnail} alt={video.title} />
                        <span className="video-duration">{video.duration}</span>
                      </div>
                      <div className="video-info">
                        <h4>{video.title}</h4>
                        <p className="channel">{video.channelTitle}</p>
                        <div className="video-meta">
                          <span>{video.viewCount} views</span>
                          <span>Published {video.publishedAt}</span>
                        </div>
                        <a 
                          href={`https://www.youtube.com/watch?v=${video.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="watch-btn"
                        >
                          Watch on YouTube
                        </a>
                      </div>
                    </div>
                  ))}
                  
                  {videoResults.length === 0 && !isLoadingVideos && (
                    <div className="no-videos">
                      <p>No videos found. Click "Find Videos" to search for related tutorials on YouTube.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="related-topics">
              <h3>Related Topics</h3>
              <div className="topic-tags">
                {tutorials.find(t => t.id === activeTutorial)?.relatedTopics.map((topic, index) => (
                  <span key={index} className="topic-tag">{topic}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="tutorials-grid">
          {tutorials
            .filter(tutorial => 
              (tutorialFilter === 'all' || tutorial.category === tutorialFilter) &&
              (userSkillLevel === 'all' || tutorial.skillLevel === userSkillLevel) &&
              (searchQuery === '' || tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
               tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map(tutorial => {
              const progress = calculateProgress(tutorial.id);
              
              return (
                <div 
                  key={tutorial.id} 
                  className={`tutorial-card ${bookmarkedTutorials.includes(tutorial.id) ? 'bookmarked' : ''}`}
                  onClick={() => setActiveTutorial(tutorial.id)}
                >
                  <div className="tutorial-top">
                    <div className="tutorial-icon">{tutorial.icon}</div>
                    <button 
                      className={`bookmark-btn ${bookmarkedTutorials.includes(tutorial.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(tutorial.id);
                      }}
                    >
                      <FaBookmark />
                    </button>
                  </div>
                  
                  <div className="tutorial-info">
                    <h3>{tutorial.title}</h3>
                    <div className="tutorial-tags">
                      <span className={`skill-level ${tutorial.skillLevel}`}>
                        {tutorial.skillLevel.charAt(0).toUpperCase() + tutorial.skillLevel.slice(1)}
                      </span>
                      <span className="type">{tutorial.type}</span>
                    </div>
                    <p className="tutorial-description">{tutorial.description}</p>
                    <div className="tutorial-meta">
                      <span className="author">By {tutorial.author}</span>
                      <span className="duration">{tutorial.duration}</span>
                    </div>
                    
                    {progress > 0 && (
                      <div className="tutorial-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="progress-text">{progress}% completed</span>
                      </div>
                    )}
                    
                    <button className="view-tutorial-btn">
                      {progress > 0 ? 'Continue Learning' : 'Start Learning'} <FaArrowRight />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );

  return (
    <div className="learning-hub">
      <div className="learning-header">
        <h1>Learning Hub</h1>
        <p>Master coding with personalized learning paths and step-by-step tutorials</p>
      </div>

      <div className="hub-navigation">
        <button 
          className={`nav-btn ${activeTab === 'paths' ? 'active' : ''}`}
          onClick={() => setActiveTab('paths')}
        >
          <FaBook /> Learning Paths
        </button>
        <button 
          className={`nav-btn ${activeTab === 'tutorials' ? 'active' : ''}`}
          onClick={() => setActiveTab('tutorials')}
        >
          <FaVideo /> Tutorials
        </button>
      </div>

      {activeTab === 'paths' && renderLearningPaths()}
      {activeTab === 'tutorials' && renderTutorials()}
      
      {/* Custom Path Modal */}
      {renderCustomPathModal()}
    </div>
  );
};

export default LearningHub;
