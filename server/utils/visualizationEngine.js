const axios = require('axios');
const GeminiClient = require('./geminiClient');

class VisualizationEngine {
    /**
     * Generates a step-by-step visualization of an algorithm
     * @param {string} code - The code to visualize
     * @param {string} language - The programming language
     * @param {object} problem - The problem data
     * @returns {object} Visualization data
     */
    static async generateVisualization(code, language, problem) {
        try {
            // Try to use Gemini API first
            if (process.env.GEMINI_API_KEY) {
                return await this.visualizeWithGemini(code, language, problem);
            }
            // Fall back to OpenAI if Gemini not available
            else if (process.env.OPENAI_API_KEY) {
                return await this.visualizeWithOpenAI(code, language, problem);
            }
            
            // Fallback to predefined visualizations if no AI API available
            return this.getPredefinedVisualization(code, language, problem);
        } catch (error) {
            console.error('Error generating visualization:', error);
            return this.getPredefinedVisualization(code, language, problem);
        }
    }
    
    /**
     * Visualize code using Gemini API
     * @private
     */
    static async visualizeWithGemini(code, language, problem) {
        const prompt = `Create a step-by-step visualization of how the following ${language} code solves the problem: "${problem.title}".
        
Problem Description:
${problem.description}

Code to visualize:
\`\`\`${language}
${code}
\`\`\`

Break down the algorithm into distinct steps. For each step provide:
1. A title
2. A brief description of what happens in this step
3. The specific code snippet related to this step
4. A visual representation of the data state at this step (as a text description that can be rendered as HTML)

Format your response as a JSON object with a "steps" array. Each step should have "title", "description", "code", and "visual" fields. 

Example format:
{
  "steps": [
    {
      "title": "Step Title",
      "description": "Description of what happens",
      "code": "relevant code snippet",
      "visual": "<div class=\"visual-element\">Visual representation goes here</div>"
    },
    // more steps...
  ]
}`;

        try {
            const visualization = await GeminiClient.generateJSON(prompt, { temperature: 0.2 });
            return visualization;
        } catch (error) {
            console.error('Error with Gemini API:', error);
            // Fall back to OpenAI if available
            if (process.env.OPENAI_API_KEY) {
                return await this.visualizeWithOpenAI(code, language, problem);
            }
            return this.getPredefinedVisualization(code, language, problem);
        }
    }
    
    /**
     * Visualize code using OpenAI API
     * @private
     */
    static async visualizeWithOpenAI(code, language, problem) {
        const prompt = `Create a step-by-step visualization of how the following ${language} code solves the problem: "${problem.title}".
        
Problem Description:
${problem.description}

Code to visualize:
\`\`\`${language}
${code}
\`\`\`

Break down the algorithm into distinct steps. For each step provide:
1. A title
2. A brief description of what happens in this step
3. The specific code snippet related to this step
4. A visual representation of the data state at this step (as a text description that can be rendered as HTML)

Format your response as a JSON object with a "steps" array. Each step should have "title", "description", "code", and "visual" fields.`;

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert at algorithm visualization. Convert code execution into clear step-by-step visualizations.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.3,
                    response_format: { type: "json_object" }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const aiResponse = JSON.parse(response.data.choices[0].message.content);
            return aiResponse;
        } catch (error) {
            console.error('Error with OpenAI API:', error.response?.data || error.message);
            return this.getPredefinedVisualization(code, language, problem);
        }
    }
    
    /**
     * Get predefined visualizations based on problem type
     * @private
     */
    static getPredefinedVisualization(code, language, problem) {
        // Identify problem type to return appropriate visualization
        const problemTitle = problem.title.toLowerCase();
        
        if (problemTitle.includes('two sum')) {
            return this.getTwoSumVisualization();
        }
        
        if (problemTitle.includes('maximum subarray')) {
            return this.getMaxSubarrayVisualization();
        }
        
        if (problemTitle.includes('parentheses') || problemTitle.includes('brackets')) {
            return this.getParenthesesVisualization();
        }
        
        // Default visualization if no specific match
        return this.getDefaultVisualization(problem);
    }
    
    /**
     * Predefined visualization for Two Sum problem
     * @private
     */
    static getTwoSumVisualization() {
        return {
            steps: [
                { 
                    title: 'Initialization', 
                    description: 'Create a hash map to store values and their indices',
                    code: 'const map = new Map();',
                    visual: '<div class="hash-map-visual">Empty hash map created</div>'
                },
                { 
                    title: 'Iteration', 
                    description: 'Loop through each element in the array',
                    code: 'for (let i = 0; i < nums.length; i++) { ... }',
                    visual: '<div class="array-visual">[2, 7, 11, 15] with pointer at first element</div>'
                },
                { 
                    title: 'Checking Complement', 
                    description: 'For each element, check if its complement exists in the hash map',
                    code: 'const complement = target - nums[i]; if (map.has(complement)) { ... }',
                    visual: '<div class="calculation-visual">complement = 9 - 2 = 7</div>'
                },
                { 
                    title: 'Adding to Map', 
                    description: 'If complement not found, add current value and index to map',
                    code: 'map.set(nums[i], i);',
                    visual: '<div class="hash-map-visual">Map: {2: 0}</div>'
                },
                { 
                    title: 'Next Iteration', 
                    description: 'Move to next element (7)',
                    code: 'i++',
                    visual: '<div class="array-visual">[2, 7, 11, 15] with pointer at second element</div>'
                },
                { 
                    title: 'Found Complement', 
                    description: 'When processing 7, we find its complement (2) already in the map',
                    code: 'const complement = target - nums[i]; // 9 - 7 = 2\nif (map.has(complement)) { return [map.get(complement), i]; }',
                    visual: '<div class="result-visual">Found complement! map[2] = 0, current i = 1, return [0, 1]</div>'
                }
            ]
        };
    }
    
    /**
     * Predefined visualization for Maximum Subarray problem
     * @private
     */
    static getMaxSubarrayVisualization() {
        return {
            steps: [
                { 
                    title: 'Initialization', 
                    description: 'Initialize variables to track current sum and maximum sum seen so far',
                    code: 'let currentSum = nums[0];\nlet maxSum = nums[0];',
                    visual: '<div class="calculation-visual">Array: [-2, 1, -3, 4, -1, 2, 1, -5, 4]\ncurrentSum = -2, maxSum = -2</div>'
                },
                { 
                    title: 'Iteration Start', 
                    description: 'Start iterating from the second element',
                    code: 'for (let i = 1; i < nums.length; i++) { ... }',
                    visual: '<div class="array-visual">[-2, 1, -3, 4, -1, 2, 1, -5, 4] with pointer at second element (1)</div>'
                },
                { 
                    title: 'Kadane\'s Algorithm', 
                    description: 'For each element, decide whether to start a new subarray or extend the current one',
                    code: 'currentSum = Math.max(nums[i], currentSum + nums[i]);',
                    visual: '<div class="calculation-visual">currentSum = Math.max(1, -2 + 1) = Math.max(1, -1) = 1</div>'
                },
                { 
                    title: 'Update Maximum', 
                    description: 'Update the maximum sum if the current sum is greater',
                    code: 'maxSum = Math.max(maxSum, currentSum);',
                    visual: '<div class="calculation-visual">maxSum = Math.max(-2, 1) = 1</div>'
                },
                { 
                    title: 'Continue Iteration', 
                    description: 'Continue through the array, applying the same logic',
                    code: 'for (let i = 1; i < nums.length; i++) {\n  currentSum = Math.max(nums[i], currentSum + nums[i]);\n  maxSum = Math.max(maxSum, currentSum);\n}',
                    visual: '<div class="array-visual">[-2, 1, -3, 4, -1, 2, 1, -5, 4] with multiple steps processed</div>'
                },
                { 
                    title: 'Final Result', 
                    description: 'After processing all elements, return the maximum sum found',
                    code: 'return maxSum;',
                    visual: '<div class="result-visual">maxSum = 6 (subarray [4, -1, 2, 1])</div>'
                }
            ]
        };
    }
    
    /**
     * Predefined visualization for Valid Parentheses problem
     * @private
     */
    static getParenthesesVisualization() {
        return {
            steps: [
                { 
                    title: 'Initialization', 
                    description: 'Create a stack to keep track of opening brackets',
                    code: 'const stack = [];',
                    visual: '<div class="hash-map-visual">Empty stack created</div>'
                },
                { 
                    title: 'Define Bracket Pairs', 
                    description: 'Define a mapping of closing brackets to their corresponding opening brackets',
                    code: 'const bracketPairs = {\n  \')\': \'(\',\n  \'}\': \'{\',\n  \']\': \'[\'\n};',
                    visual: '<div class="hash-map-visual">Map: {\')\': \'(\', \'}\': \'{\', \']\': \'[\'}</div>'
                },
                { 
                    title: 'Iteration', 
                    description: 'Loop through each character in the input string',
                    code: 'for (let i = 0; i < s.length; i++) { ... }',
                    visual: '<div class="array-visual">String: "({[]})" with pointer at first character</div>'
                },
                { 
                    title: 'Process Opening Bracket', 
                    description: 'If character is an opening bracket, push it onto the stack',
                    code: 'if (s[i] === \'(\' || s[i] === \'{\' || s[i] === \'[\') {\n  stack.push(s[i]);\n}',
                    visual: '<div class="calculation-visual">Character: (, Push to stack\nStack: [(]</div>'
                },
                { 
                    title: 'Process Closing Bracket', 
                    description: 'If character is a closing bracket, check if it matches the top of the stack',
                    code: 'else {\n  if (stack.pop() !== bracketPairs[s[i]]) {\n    return false;\n  }\n}',
                    visual: '<div class="calculation-visual">Character: ), Pop from stack, Check if ( === (</div>'
                },
                { 
                    title: 'Final Check', 
                    description: 'After processing all characters, the stack should be empty for valid input',
                    code: 'return stack.length === 0;',
                    visual: '<div class="result-visual">Stack is empty, return true</div>'
                }
            ]
        };
    }
    
    /**
     * Default visualization for unknown problems
     * @private
     */
    static getDefaultVisualization(problem) {
        return {
            steps: [
                { 
                    title: 'Problem Analysis', 
                    description: `Understanding the problem: ${problem.title}`,
                    code: '// Analyze the problem\n// ${problem.description}',
                    visual: '<div class="calculation-visual">Analyzing problem requirements</div>'
                },
                { 
                    title: 'Algorithm Design', 
                    description: 'Planning the approach to solve the problem',
                    code: '// Design the algorithm\n// Step 1: ...\n// Step 2: ...',
                    visual: '<div class="calculation-visual">Planning the algorithm approach</div>'
                },
                { 
                    title: 'Implementation', 
                    description: 'Writing the code to solve the problem',
                    code: '// Implement the solution',
                    visual: '<div class="calculation-visual">Implementing the solution in code</div>'
                },
                { 
                    title: 'Testing', 
                    description: 'Testing the solution with example inputs',
                    code: '// Test with example cases',
                    visual: '<div class="calculation-visual">Testing with examples from the problem</div>'
                },
                { 
                    title: 'Optimization', 
                    description: 'Optimizing the solution for better performance',
                    code: '// Optimize for time and space complexity',
                    visual: '<div class="calculation-visual">Reviewing and optimizing the solution</div>'
                }
            ]
        };
    }
}

module.exports = VisualizationEngine;