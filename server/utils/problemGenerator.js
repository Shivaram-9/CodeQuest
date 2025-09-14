const GeminiClient = require('./geminiClient');

class ProblemGenerator {
  /**
   * Generate a new coding problem based on given criteria
   * @param {object} options - Problem generation options
   * @returns {object} Generated problem
   */
  static async generateProblem(options = {}) {
    try {
      const {
        topic = 'arrays',
        difficulty = 'medium', 
        complexity = 'moderate',
        includeTestCases = true
      } = options;
      
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key is required for problem generation');
      }
      
      return await this.generateWithGemini(topic, difficulty, complexity, includeTestCases);
    } catch (error) {
      console.error('Error generating problem:', error);
      throw error;
    }
  }
  
  /**
   * Generate problem using Gemini API
   * @private
   */
  static async generateWithGemini(topic, difficulty, complexity, includeTestCases) {
    const prompt = `Create a coding problem about ${topic} with ${difficulty} difficulty and ${complexity} algorithmic complexity.

The problem should include:
1. A title
2. A detailed description
3. Input format explanation
4. Output format explanation
5. Constraints on the input
6. ${includeTestCases ? '3-5 example test cases with inputs, expected outputs, and explanations' : 'At least 2 example test cases'}
7. Hints about how to approach the problem (3 hints maximum)
8. Starter code templates for JavaScript and Python

Format your response as a JSON object with the following structure:
{
  "title": "Problem Title",
  "difficulty": "${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}",
  "tags": ["tag1", "tag2", "tag3"],
  "description": "Detailed problem description",
  "inputFormat": "Description of input format",
  "outputFormat": "Description of output format",
  "constraints": ["constraint 1", "constraint 2", ...],
  "examples": [
    {
      "input": "Sample input 1",
      "output": "Expected output 1",
      "explanation": "Explanation of how input leads to output"
    },
    ...
  ],
  "hints": ["hint 1", "hint 2", "hint 3"],
  "starterCode": {
    "javascript": "JavaScript code template",
    "python": "Python code template"
  }
}`;

    try {
      const problem = await GeminiClient.generateJSON(prompt, { 
        temperature: 0.7,
        maxTokens: 4096
      });
      
      return {
        ...problem,
        testCases: this.generateTestCases(problem)
      };
    } catch (error) {
      console.error('Error with Gemini API:', error);
      throw error;
    }
  }
  
  /**
   * Generate test cases from problem examples
   * @private
   */
  static generateTestCases(problem) {
    try {
      // Create test cases from examples
      const testCases = problem.examples.map((example, index) => {
        // Try to parse input and output in a format suitable for testing
        // This is a simplified version - in a real app you'd need more robust parsing
        let input, expected;
        
        try {
          // Try to parse as JSON first
          input = JSON.parse(example.input);
        } catch (e) {
          // If not valid JSON, treat as string
          input = example.input;
        }
        
        try {
          expected = JSON.parse(example.output);
        } catch (e) {
          expected = example.output;
        }
        
        return {
          id: index + 1,
          input,
          expected,
          explanation: example.explanation,
          isHidden: false
        };
      });
      
      return testCases;
    } catch (error) {
      console.error('Error generating test cases:', error);
      return [];
    }
  }
}

module.exports = ProblemGenerator; 