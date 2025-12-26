const axios = require('axios');
const GeminiClient = require('./geminiClient');

class CodeAnalyzer {
    /**
     * Analyzes code for quality, efficiency, and correctness
     * @param {string} code - The code to analyze
     * @param {string} language - The programming language
     * @param {object} problem - The problem data
     * @returns {object} Analysis results
     */
    static async analyzeCode(code, language, problem) {
        try {
            // Try to use Gemini API first
            if (process.env.GEMINI_API_KEY) {
                return await this.analyzeWithGemini(code, language, problem);
            }
            // Fall back to OpenAI if Gemini not available
            else if (process.env.OPENAI_API_KEY) {
                return await this.analyzeWithOpenAI(code, language, problem);
            }
            
            // Fallback to basic analysis if no AI API available
            return this.basicAnalysis(code, language, problem);
        } catch (error) {
            console.error('Error analyzing code:', error);
            return this.basicAnalysis(code, language, problem);
        }
    }
    
    /**
     * Generate real-time suggestions for code
     * @param {string} code - The code to get suggestions for
     * @param {string} language - The programming language
     * @param {object} problem - The problem data
     * @returns {string} Suggestion text
     */
    static async generateSuggestion(code, language, problem) {
        try {
            // Try to use Gemini API first
            if (process.env.GEMINI_API_KEY) {
                return await this.getSuggestionWithGemini(code, language, problem);
            }
            // Fall back to OpenAI if Gemini not available
            else if (process.env.OPENAI_API_KEY) {
                return await this.getSuggestionWithOpenAI(code, language, problem);
            }
            
            // Fallback to basic suggestions
            return this.getBasicSuggestion(code, language, problem);
        } catch (error) {
            console.error('Error generating suggestion:', error);
            return this.getBasicSuggestion(code, language, problem);
        }
    }
    
    /**
     * Analyze code using Gemini API
     * @private
     */
    static async analyzeWithGemini(code, language, problem) {
        const prompt = `Analyze the following ${language} code for the problem: "${problem.title}".
        
Problem Description:
${problem.description}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Your analysis should include:
1. Time complexity
2. Space complexity
3. Correctness assessment
4. Code quality evaluation
5. Suggestions for improvement
6. A score from 0 to 100

Format your response as JSON with the following structure:
{
  "complexity": {
    "time": "O(?)",
    "space": "O(?)"
  },
  "score": 75,
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "feedback": "Overall assessment of the code"
}`;

        try {
            const result = await GeminiClient.generateJSON(prompt, { temperature: 0.3 });
            return result;
        } catch (error) {
            console.error('Error with Gemini API:', error);
            // Fall back to OpenAI if available
            if (process.env.OPENAI_API_KEY) {
                return await this.analyzeWithOpenAI(code, language, problem);
            }
            return this.basicAnalysis(code, language, problem);
        }
    }
    
    /**
     * Generate suggestion using Gemini API
     * @private
     */
    static async getSuggestionWithGemini(code, language, problem) {
        const prompt = `I'm working on a coding problem in ${language}. Here's what I've written so far:
        
\`\`\`${language}
${code}
\`\`\`

The problem is: "${problem.title}" - ${problem.description}

Give me a brief, focused suggestion for improving my code or approach. Keep your response under 100 words.`;

        try {
            const suggestion = await GeminiClient.generateContent(prompt, { 
                temperature: 0.3,
                maxTokens: 150
            });
            return suggestion;
        } catch (error) {
            console.error('Error with Gemini API:', error);
            // Fall back to OpenAI if available
            if (process.env.OPENAI_API_KEY) {
                return await this.getSuggestionWithOpenAI(code, language, problem);
            }
            return this.getBasicSuggestion(code, language, problem);
        }
    }
    
    /**
     * Analyze code using OpenAI API
     * @private
     */
    static async analyzeWithOpenAI(code, language, problem) {
        const prompt = `Analyze the following ${language} code for the problem: "${problem.title}".
        
Problem Description:
${problem.description}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Your analysis should include:
1. Time complexity
2. Space complexity
3. Correctness assessment
4. Code quality evaluation
5. Suggestions for improvement
6. A score from 0 to 100`;

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert code analyzer specialized in algorithmic analysis and optimization.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.3
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const aiResponse = response.data.choices[0].message.content;
            
            // Extract key information from AI response
            // This is a simplified extraction; in production you'd use more robust parsing
            const timeComplexityMatch = aiResponse.match(/Time complexity:?\s*([O][\(\)a-zA-Z0-9\s\^\*\+\-\,\.]+)/i);
            const spaceComplexityMatch = aiResponse.match(/Space complexity:?\s*([O][\(\)a-zA-Z0-9\s\^\*\+\-\,\.]+)/i);
            const scoreMatch = aiResponse.match(/Score:?\s*(\d+)/i);
            
            const suggestions = aiResponse.split('Suggestions for improvement:')[1]?.split('\n').filter(s => s.trim().length > 0).map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(s => s.length > 0) || [];
            
            return {
                complexity: {
                    time: timeComplexityMatch ? timeComplexityMatch[1].trim() : 'O(n)',
                    space: spaceComplexityMatch ? spaceComplexityMatch[1].trim() : 'O(n)'
                },
                score: scoreMatch ? parseInt(scoreMatch[1]) : 70,
                suggestions: suggestions.slice(0, 3),
                improvements: [
                    'Consider edge cases',
                    'Add input validation',
                    'Use more descriptive variable names'
                ],
                feedback: aiResponse.split('\n\n')[0]
            };
        } catch (error) {
            console.error('Error with OpenAI API:', error.response?.data || error.message);
            return this.basicAnalysis(code, language, problem);
        }
    }
    
    /**
     * Generate suggestion using OpenAI API
     * @private
     */
    static async getSuggestionWithOpenAI(code, language, problem) {
        const prompt = `I'm working on a coding problem in ${language}. Here's what I've written so far:
        
\`\`\`${language}
${code}
\`\`\`

The problem is: "${problem.title}" - ${problem.description}

Give me a brief, focused suggestion for improving my code or approach. Keep your response under 100 words.`;

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful programming assistant. Provide brief, focused code suggestions.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 150
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error with OpenAI API:', error.response?.data || error.message);
            return this.getBasicSuggestion(code, language, problem);
        }
    }
    
    /**
     * Basic code analysis without using external AI API
     * @private
     */
    static basicAnalysis(code, language, problem) {
        // Perform basic static analysis
        const codeLines = code.split('\n').length;
        const codeChars = code.length;
        
        // Check for common code smells
        const hasComments = code.includes('//') || code.includes('/*');
        const hasLongLines = code.split('\n').some(line => line.length > 100);
        const hasNestedLoops = (code.match(/for\s*\(/g) || []).length > 1;
        
        // Generate analysis based on basic checks
        const analysis = {
            complexity: {
                time: hasNestedLoops ? 'O(n²)' : 'O(n)',
                space: 'O(n)'
            },
            score: hasComments ? 75 : 65,
            suggestions: [],
            improvements: [],
            feedback: 'Your solution works but could be optimized.'
        };
        
        // Add suggestions based on code smells
        if (!hasComments) {
            analysis.suggestions.push('Add comments to explain your approach');
        }
        
        if (hasLongLines) {
            analysis.suggestions.push('Break down long lines of code for better readability');
        }
        
        if (hasNestedLoops) {
            analysis.suggestions.push('Consider if nested loops can be avoided for better time complexity');
            analysis.improvements.push('Look for ways to use a hash map to reduce time complexity');
        }
        
        // Add more generic improvements
        analysis.improvements.push('Ensure edge cases are handled properly');
        analysis.improvements.push('Consider input validation for robust code');
        
        return analysis;
    }
    
    /**
     * Generate basic suggestion without AI
     * @private
     */
    static getBasicSuggestion(code, language, problem) {
        // Analyze the code to determine what suggestion to give
        const hasMap = code.includes('Map') || code.includes('map') || code.includes('dict') || code.includes('{}');
        const hasLoop = code.includes('for') || code.includes('while');
        const hasRecursion = code.includes('function') && code.match(/\w+\s*\([^)]*\)[^{]*\{[^}]*\1\s*\(/);
        
        // Select suggestion based on analysis
        if (problem.title.includes('Two Sum') && !hasMap) {
            return 'Consider using a hash map to store values you\'ve seen, allowing O(1) lookup time for complements.';
        }
        
        if (problem.difficulty === 'Easy' && hasRecursion) {
            return 'While recursion works, an iterative solution might be more efficient for this problem due to lower overhead.';
        }
        
        if (!hasLoop && problem.difficulty !== 'Easy') {
            return 'Most algorithm problems require some form of iteration. Consider how to process the input systematically.';
        }
        
        // Generic suggestions if no specific condition matches
        const genericSuggestions = [
            'Consider edge cases like empty inputs or boundary values.',
            'Think about optimizing your solution for better time complexity.',
            'Adding comments to explain your approach would improve code readability.',
            'Make sure to validate inputs before processing them.',
            'Consider using a hash map for O(1) lookups when searching for values.'
        ];
        
        return genericSuggestions[Math.floor(Math.random() * genericSuggestions.length)];
    }
}

module.exports = CodeAnalyzer;