const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateExplanation = async (problem, conceptRequest) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Problem: ${problem.title}
      Description: ${problem.description}
      
      Please provide a detailed explanation of the key concepts and approach for solving this problem.
      Focus on:
      1. Problem analysis and understanding
      2. Optimal solution approach
      3. Time and space complexity
      4. Key concepts and techniques used
      
      Format the response as a structured explanation with examples.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return {
      concepts: [
        {
          topic: 'Problem Analysis',
          explanation: text.split('\n\n')[0] || 'Analysis of the problem',
          examples: problem.examples || []
        },
        {
          topic: 'Solution Approach',
          explanation: text.split('\n\n')[1] || 'Optimal approach explanation',
          examples: problem.hints || []
        }
      ]
    };
  } catch (error) {
    console.error('Error generating explanation:', error);
    throw error;
  }
};

const generateQuiz = async (problem) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Problem: ${problem.title}
      Description: ${problem.description}
      
      Generate 3 multiple-choice questions about this problem focusing on:
      1. Key concepts and techniques
      2. Time and space complexity
      3. Edge cases and constraints
      
      Format each question with:
      - Question text
      - 4 options (A, B, C, D)
      - Correct answer
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response into quiz questions
    const questions = text.split('\n\n').map(q => {
      const lines = q.split('\n');
      return {
        question: lines[0],
        options: lines.slice(1, 5),
        correctAnswer: lines[5]?.match(/[A-D]/)?.[0] || 'A'
      };
    });
    
    return { questions };
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

module.exports = {
  generateExplanation,
  generateQuiz
}; 