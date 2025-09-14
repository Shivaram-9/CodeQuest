const axios = require('axios');
require('dotenv').config();

class GeminiClient {
  /**
   * Make a request to the Gemini API
   * @param {string} prompt - The user prompt
   * @param {object} options - Additional options
   * @returns {Promise<object>} - The Gemini response
   */
  static async generateContent(prompt, options = {}) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const apiUrl = process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro";
      
      const requestData = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: options.temperature || 0.4,
          topK: options.topK || 32,
          topP: options.topP || 1,
          maxOutputTokens: options.maxTokens || 2048,
        }
      };

      const response = await axios.post(
        `${apiUrl}:generateContent?key=${apiKey}`,
        requestData
      );

      // Extract the response text
      if (response.data.candidates && response.data.candidates.length > 0) {
        const content = response.data.candidates[0].content;
        if (content && content.parts && content.parts.length > 0) {
          return content.parts[0].text;
        }
      }
      
      throw new Error('Invalid response format from Gemini API');
    } catch (error) {
      console.error('Error with Gemini API:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Generate JSON response from Gemini
   * @param {string} prompt - The user prompt
   * @param {object} options - Additional options
   * @returns {Promise<object>} - The parsed JSON response
   */
  static async generateJSON(prompt, options = {}) {
    try {
      // Add instructions to format response as JSON
      const jsonPrompt = `${prompt}\n\nProvide your response in valid JSON format only, with no additional text before or after the JSON.`;
      
      const response = await this.generateContent(jsonPrompt, options);
      
      // Clean the response to extract just the JSON part
      let jsonStr = response.trim();
      
      // If response is wrapped in code blocks, extract the JSON
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Try to parse the JSON response
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error parsing JSON from Gemini response:', error);
      throw error;
    }
  }
}

module.exports = GeminiClient; 