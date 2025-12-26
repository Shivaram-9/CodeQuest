const axios = require('axios');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Problem = require('../models/Problem');
const GeminiClient = require('./geminiClient');

class RecommendationEngine {
    static async getRecommendedChallenges(user, submissions = []) {
        try {
            // In a production environment, you'd implement a more sophisticated
            // recommendation algorithm based on user history and preferences
            
            // Get all problems
            const allProblems = await Problem.find({})
                .select('id title difficulty tags solvedCount');
            
            // Get user's solved problems
            const solvedProblemIds = user.completedProblems || [];
            
            // Filter out problems the user has already solved
            let availableProblems = allProblems.filter(
                problem => !solvedProblemIds.includes(problem.id)
            );
            
            // If no previous submissions, recommend easy problems first
            if (submissions.length === 0) {
                availableProblems = availableProblems.filter(
                    problem => problem.difficulty.toLowerCase() === 'easy'
                );
            }
            
            // If user has solved some problems, analyze their history
            const recommendations = [];
            
            if (submissions.length > 0) {
                // Analyze user's past performance and interests
                const tags = this.getPreferredTags(submissions);
                const difficultyLevel = this.getDifficultyLevel(user, submissions);
                
                // Find problems that match the user's interests and skill level
                for (const tag of tags) {
                    const matchingProblems = availableProblems.filter(
                        problem => problem.tags.includes(tag) && 
                                   this.matchesDifficulty(problem.difficulty, difficultyLevel)
                    );
                    
                    // Add top 2 matching problems for each tag
                    recommendations.push(...matchingProblems.slice(0, 2));
                    
                    // Stop once we have enough recommendations
                    if (recommendations.length >= 5) break;
                }
            }
            
            // If we still need more recommendations, add some random problems
            if (recommendations.length < 5) {
                const remainingProblems = availableProblems.filter(
                    problem => !recommendations.some(rec => rec.id === problem.id)
                );
                
                // Sort by popularity (most solved)
                remainingProblems.sort((a, b) => (b.solvedCount || 0) - (a.solvedCount || 0));
                
                // Add top problems to reach 5 recommendations
                recommendations.push(...remainingProblems.slice(0, 5 - recommendations.length));
            }
            
            // Format recommendations with relevance and reason
            return recommendations.map(problem => ({
                id: problem.id,
                title: problem.title,
                difficulty: problem.difficulty,
                relevance: this.getRelevance(problem, user, submissions),
                reason: this.getRecommendationReason(problem, user, submissions)
            }));
        } catch (error) {
            console.error('Error getting recommendations:', error);
            
            // Return some default recommendations
            return [
                { id: 1, title: 'Two Sum', difficulty: 'Easy', relevance: 'High', reason: 'Popular beginner problem' },
                { id: 2, title: 'Maximum Subarray Sum', difficulty: 'Medium', relevance: 'Medium', reason: 'Builds on array manipulation skills' },
                { id: 3, title: 'Valid Parentheses', difficulty: 'Easy', relevance: 'High', reason: 'Stack implementation practice' }
            ];
        }
    }

    static async getPersonalizedLearningPath(user) {
        try {
            // In a production environment, you'd have a database of learning resources
            // and a more sophisticated algorithm for path generation
            
            // Get user's skill level
            const skillLevel = user.skillLevel || 'beginner';
            
            // Get completed problems
            const completedProblemIds = user.completedProblems || [];
            const completedProblems = await Problem.find({
                _id: { $in: completedProblemIds }
            }).select('tags difficulty');
            
            // Analyze completed problems to determine strengths and weaknesses
            const strengths = this.getUserStrengths(completedProblems);
            const weaknesses = this.getUserWeaknesses(completedProblems);
            
            // Generate learning path based on skill level and areas to improve
            return this.generateLearningPath(skillLevel, strengths, weaknesses);
        } catch (error) {
            console.error('Error generating learning path:', error);
            
            // Return default learning path
            return [
                {
                    title: 'Data Structures Mastery',
                    progress: 30,
                    nextLesson: 'Hash Tables',
                    totalLessons: 12,
                    completedLessons: 4,
                    estimatedTimeLeft: '4 hours'
                },
                {
                    title: 'Algorithm Specialization',
                    progress: 20,
                    nextLesson: 'Greedy Algorithms',
                    totalLessons: 15,
                    completedLessons: 3,
                    estimatedTimeLeft: '6 hours'
                }
            ];
        }
    }

    static async generateConceptExplanation(problem, conceptRequest) {
        try {
            // Try to use Gemini API first
            if (process.env.GEMINI_API_KEY) {
                return await this.explainWithGemini(problem, conceptRequest);
            }
            // Fall back to OpenAI if Gemini not available
            else if (process.env.OPENAI_API_KEY) {
                return await this.explainWithOpenAI(problem, conceptRequest);
            }
            
            // Fallback to predefined explanations
            return this.getPredefinedExplanation(problem);
        } catch (error) {
            console.error('Error generating explanation:', error);
            return this.getPredefinedExplanation(problem);
        }
    }

    static async explainWithGemini(problem, conceptRequest) {
        const prompt = `Explain concepts related to solving this coding problem: "${problem.title}".
        
Problem Description:
${problem.description}

Specific concept requested: ${conceptRequest}

Provide at least 2 key concepts that would help someone solve this problem. For each concept, include:
1. The concept name/title
2. A clear explanation in simple terms
3. Examples of when/how to apply the concept

Format your response as a JSON object with a "concepts" array. Each concept should have "topic", "explanation", and "examples" fields.

Example format:
{
  "concepts": [
    {
      "topic": "Concept Name",
      "explanation": "Clear explanation in simple terms",
      "examples": ["Example 1", "Example 2", "Example 3"]
    },
    // more concepts...
  ]
}`;

        try {
            const explanation = await GeminiClient.generateJSON(prompt, { temperature: 0.5 });
            return explanation;
        } catch (error) {
            console.error('Error with Gemini API:', error);
            // Fall back to OpenAI if available
            if (process.env.OPENAI_API_KEY) {
                return await this.explainWithOpenAI(problem, conceptRequest);
            }
            return this.getPredefinedExplanation(problem);
        }
    }

    static async explainWithOpenAI(problem, conceptRequest) {
        const prompt = `Explain concepts related to solving this coding problem: "${problem.title}".
        
Problem Description:
${problem.description}

Specific concept requested: ${conceptRequest}

Provide at least 2 key concepts that would help someone solve this problem. For each concept, include:
1. The concept name/title
2. A clear explanation in simple terms
3. Examples of when/how to apply the concept

Format your response as a JSON object with a "concepts" array. Each concept should have "topic", "explanation", and "examples" fields.`;

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert computer science educator who explains complex concepts clearly.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.5,
                    response_format: { type: "json_object" }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return JSON.parse(response.data.choices[0].message.content);
        } catch (error) {
            console.error('Error with OpenAI API:', error.response?.data || error.message);
            return this.getPredefinedExplanation(problem);
        }
    }

    static getPredefinedExplanation(problem) {
        // Identify problem type to return appropriate explanations
        const problemTitle = problem.title.toLowerCase();
        const problemTags = problem.tags || [];
        
        if (problemTitle.includes('two sum') || problemTags.includes('Hash Table')) {
            return {
                concepts: [
                    {
                        topic: 'Hash Tables',
                        explanation: 'Hash tables provide O(1) average-case lookup time, making them ideal for problems where you need to quickly check if a value exists or retrieve a value associated with a key. They\'re implemented as Map in JavaScript, dict in Python, HashMap in Java, etc.',
                        examples: [
                            'Checking if a number exists in an array',
                            'Finding pairs that sum to a target value',
                            'Counting frequency of elements'
                        ]
                    },
                    {
                        topic: 'Complement Pattern',
                        explanation: 'The complement pattern involves finding pairs of values that satisfy a certain condition (usually summing to a target). For each value, you calculate its "complement" and check if it exists in your data structure.',
                        examples: ['Two Sum problem: For target sum T and value A, look for complement T - A', 'Array intersection: Store one array in a set, check each element from second array']
                    }
                ]
            };
        }
        
        if (problemTitle.includes('maximum subarray') || problemTags.includes('Dynamic Programming')) {
            return {
                concepts: [
                    {
                        topic: 'Kadane\'s Algorithm',
                        explanation: 'Kadane\'s Algorithm is a dynamic programming approach for finding the maximum sum subarray with O(n) time complexity. The key insight is tracking the current sum and resetting when it becomes negative.',
                        examples: ['Maximum Subarray problem', 'Stock price problems', 'Finding maximum profit windows']
                    },
                    {
                        topic: 'Dynamic Programming',
                        explanation: 'Dynamic Programming solves complex problems by breaking them down into simpler subproblems, solving each once, and storing their solutions. It combines optimal solutions to subproblems to get the optimal solution for the original problem.',
                        examples: ['Maximum Subarray', 'Fibonacci sequence', 'Knapsack problems', 'Longest common subsequence']
                    }
                ]
            };
        }
        
        if (problemTitle.includes('valid parentheses') || problemTags.includes('Stack')) {
            return {
                concepts: [
                    {
                        topic: 'Stack Data Structure',
                        explanation: 'A stack is a Last-In-First-Out (LIFO) data structure where elements are added and removed from the same end (the "top"). It\'s ideal for problems involving processing items in reverse order or tracking nested operations.',
                        examples: ['Matching parentheses/brackets', 'Syntax parsing', 'Function call management', 'Undo functionality']
                    },
                    {
                        topic: 'Balanced Parentheses Pattern',
                        explanation: 'The balanced parentheses pattern involves using a stack to track opening brackets, and for each closing bracket, checking if it matches the most recent opening bracket. If all brackets are properly nested, the stack will be empty at the end.',
                        examples: ['Valid Parentheses problem', 'XML/HTML tag validation', 'Expression evaluation']
                    }
                ]
            };
        }
        
        // Default explanations for unknown problems
        return {
            concepts: [
                {
                    topic: 'Problem Solving Approach',
                    explanation: 'A systematic problem-solving approach involves understanding the problem, planning a solution, implementing the solution, and then testing/refining it. Breaking problems down into smaller steps makes complex tasks manageable.',
                    examples: ['Divide and conquer algorithms', 'Test-driven development', 'Incremental solution building']
                },
                {
                    topic: 'Time and Space Complexity',
                    explanation: 'Time complexity measures how the runtime of an algorithm grows with input size, while space complexity measures memory usage. Efficient algorithms minimize both, often requiring trade-offs between the two.',
                    examples: ['Big O notation: O(1), O(n), O(n²)', 'Memory-efficient algorithms', 'Optimizing nested loops']
                }
            ]
        };
    }

    // Helper methods for the recommendation engine
    
    static getPreferredTags(submissions) {
        // Count frequency of tags in successfully submitted problems
        const tagCounts = {};
        
        submissions.forEach(submission => {
            if (submission.status === 'accepted' && submission.problem && submission.problem.tags) {
                submission.problem.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });
        
        // Sort tags by frequency
        const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
        
        // Return top 3 tags or all if less than 3
        return sortedTags.slice(0, 3);
    }
    
    static getDifficultyLevel(user, submissions) {
        const difficultyCounts = {
            easy: 0,
            medium: 0,
            hard: 0
        };
        
        // Count successful submissions by difficulty
        submissions.forEach(submission => {
            if (submission.status === 'accepted' && submission.problem) {
                const difficulty = submission.problem.difficulty.toLowerCase();
                difficultyCounts[difficulty] = (difficultyCounts[difficulty] || 0) + 1;
            }
        });
        
        // Determine appropriate difficulty level
        if (difficultyCounts.hard >= 5) {
            return 'hard';
        } else if (difficultyCounts.medium >= 10 || difficultyCounts.hard >= 2) {
            return 'medium';
        } else {
            return 'easy';
        }
    }
    
    static matchesDifficulty(problemDifficulty, targetLevel) {
        problemDifficulty = problemDifficulty.toLowerCase();
        
        if (targetLevel === 'easy') {
            return problemDifficulty === 'easy';
        } else if (targetLevel === 'medium') {
            return problemDifficulty === 'easy' || problemDifficulty === 'medium';
        } else {
            return true; // For 'hard' level, any difficulty is fine
        }
    }
    
    static getRelevance(problem, user, submissions) {
        // Determine how relevant this problem is to the user
        const tags = this.getPreferredTags(submissions);
        const matchingTags = problem.tags.filter(tag => tags.includes(tag));
        
        if (matchingTags.length >= 2) {
            return 'High';
        } else if (matchingTags.length >= 1) {
            return 'Medium';
        } else {
            return 'Low';
        }
    }
    
    static getRecommendationReason(problem, user, submissions) {
        // Generate a reason based on user history and problem features
        const tags = this.getPreferredTags(submissions);
        const matchingTags = problem.tags.filter(tag => tags.includes(tag));
        
        if (matchingTags.length > 0) {
            return `Aligns with your interest in ${matchingTags.join(' and ')}`;
        } else if (problem.solvedCount > 1000) {
            return 'Popular problem with high solve rate';
        } else if (problem.difficulty.toLowerCase() === 'easy') {
            return 'Good practice for fundamentals';
        } else if (problem.difficulty.toLowerCase() === 'medium') {
            return 'Will help you develop problem-solving skills';
        } else {
            return 'Challenging problem to test your abilities';
        }
    }
    
    static getUserStrengths(completedProblems) {
        // Count tags in successfully completed problems
        const tagCounts = {};
        
        completedProblems.forEach(problem => {
            if (problem.tags) {
                problem.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });
        
        // Sort tags by frequency
        const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
        
        // Return top 3 tags or all if less than 3
        return sortedTags.slice(0, 3);
    }
    
    static getUserWeaknesses(completedProblems) {
        // Common problem tags
        const commonTags = [
            'Arrays', 'Strings', 'Hash Table', 'Dynamic Programming', 'Graphs', 
            'Trees', 'Linked Lists', 'Stack', 'Queue', 'Recursion'
        ];
        
        // Get strengths
        const strengths = this.getUserStrengths(completedProblems);
        
        // Find tags with low representation
        const weaknesses = commonTags.filter(tag => !strengths.includes(tag));
        
        // Return top 3 weaknesses
        return weaknesses.slice(0, 3);
    }
    
    static generateLearningPath(skillLevel, strengths, weaknesses) {
        // Generate learning paths that build on strengths and address weaknesses
        const learningPaths = [];
        
        // Add path based on top strength
        if (strengths.length > 0) {
            learningPaths.push({
                title: `Advanced ${strengths[0]} Techniques`,
                progress: Math.floor(Math.random() * 50) + 20,
                nextLesson: this.getNextLessonForTopic(strengths[0]),
                totalLessons: 12,
                completedLessons: Math.floor(Math.random() * 6) + 2,
                estimatedTimeLeft: `${Math.floor(Math.random() * 5) + 2} hours`
            });
        }
        
        // Add path based on top weakness
        if (weaknesses.length > 0) {
            learningPaths.push({
                title: `${weaknesses[0]} Fundamentals`,
                progress: Math.floor(Math.random() * 30) + 10,
                nextLesson: this.getNextLessonForTopic(weaknesses[0]),
                totalLessons: 15,
                completedLessons: Math.floor(Math.random() * 3) + 1,
                estimatedTimeLeft: `${Math.floor(Math.random() * 6) + 4} hours`
            });
        }
        
        // Add general path based on skill level
        const generalPath = this.getGeneralPath(skillLevel);
        learningPaths.push(generalPath);
        
        return learningPaths;
    }
    
    static getNextLessonForTopic(topic) {
        const lessonsByTopic = {
            'Arrays': ['Array Manipulation', 'Sliding Window Technique', 'Two Pointer Approach'],
            'Strings': ['String Matching', 'Regular Expressions', 'String Compression'],
            'Hash Table': ['Hash Function Design', 'Collision Resolution', 'Efficient Lookups'],
            'Dynamic Programming': ['Memoization Techniques', 'Bottom-up Approaches', 'State Transitions'],
            'Graphs': ['Graph Traversal', 'Shortest Path Algorithms', 'Minimum Spanning Trees'],
            'Trees': ['Tree Traversal', 'Balanced Trees', 'Trie Data Structure'],
            'Linked Lists': ['Fast & Slow Pointers', 'Linked List Manipulation', 'Cycle Detection'],
            'Stack': ['Stack Applications', 'Monotonic Stack Pattern', 'Expression Evaluation'],
            'Queue': ['Queue Implementation', 'Priority Queues', 'BFS Applications'],
            'Recursion': ['Recursive Thinking', 'Tail Recursion', 'Divide and Conquer']
        };
        
        const lessons = lessonsByTopic[topic] || ['Fundamentals', 'Advanced Techniques', 'Practical Applications'];
        
        // Return a random lesson from the list
        return lessons[Math.floor(Math.random() * lessons.length)];
    }
    
    static getGeneralPath(skillLevel) {
        switch(skillLevel.toLowerCase()) {
            case 'beginner':
                return {
                    title: 'Programming Fundamentals',
                    progress: Math.floor(Math.random() * 40) + 10,
                    nextLesson: 'Algorithm Analysis',
                    totalLessons: 10,
                    completedLessons: Math.floor(Math.random() * 4) + 1,
                    estimatedTimeLeft: `${Math.floor(Math.random() * 4) + 3} hours`
                };
            case 'intermediate':
                return {
                    title: 'Data Structures Mastery',
                    progress: Math.floor(Math.random() * 40) + 30,
                    nextLesson: 'Hash Table Implementation',
                    totalLessons: 12,
                    completedLessons: Math.floor(Math.random() * 5) + 3,
                    estimatedTimeLeft: `${Math.floor(Math.random() * 3) + 2} hours`
                };
            case 'advanced':
            case 'expert':
                return {
                    title: 'Advanced Algorithms',
                    progress: Math.floor(Math.random() * 30) + 40,
                    nextLesson: 'Graph Optimization Problems',
                    totalLessons: 15,
                    completedLessons: Math.floor(Math.random() * 6) + 6,
                    estimatedTimeLeft: `${Math.floor(Math.random() * 3) + 1} hours`
                };
            default:
            return {
                    title: 'Coding Fundamentals',
                    progress: 25,
                    nextLesson: 'Basic Data Structures',
                    totalLessons: 10,
                    completedLessons: 2,
                    estimatedTimeLeft: '4 hours'
                };
        }
    }
}

module.exports = RecommendationEngine;