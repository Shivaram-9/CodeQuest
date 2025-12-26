import React, { useState, useEffect } from 'react';
import { FaFilter, FaLightbulb, FaCode, FaCheck, FaQuestionCircle } from 'react-icons/fa';
import './CodingPortal.css';

const CodingPortal = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [code, setCode] = useState('');
  const [theme, setTheme] = useState('light');
  const [activeSection, setActiveSection] = useState('description');

  const challenges = [
    {
      id: 1,
      title: 'Two Sum',
      difficulty: 'easy',
      topic: 'arrays',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      explanation: 'This problem requires you to find two numbers in an array that add up to a specific target. You can solve this efficiently using a hash map to store the complement of each number.',
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9'
      ],
      testCases: [
        { input: '[2,7,11,15], target = 9', output: '[0,1]' },
        { input: '[3,2,4], target = 6', output: '[1,2]' }
      ]
    },
    // Add more challenges
  ];

  const handleSubmit = () => {
    // Add code submission logic
    console.log('Code submitted:', code);
  };

  const handleRunTests = () => {
    // Add test execution logic
    console.log('Running tests...');
  };

  return (
    <div className="coding-portal">
      <div className="challenge-filters">
        <div className="filter-group">
          <label>Difficulty:</label>
          <select 
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="all">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Topic:</label>
          <select 
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="all">All</option>
            <option value="arrays">Arrays</option>
            <option value="strings">Strings</option>
            <option value="dp">Dynamic Programming</option>
          </select>
        </div>
      </div>

      <div className="coding-workspace">
        <div className="challenge-description">
          <div className="challenge-nav">
            <button 
              className={activeSection === 'description' ? 'active' : ''}
              onClick={() => setActiveSection('description')}
            >
              <FaQuestionCircle /> Description
            </button>
            <button 
              className={activeSection === 'explanation' ? 'active' : ''}
              onClick={() => setActiveSection('explanation')}
            >
              <FaLightbulb /> Explanation
            </button>
            <button 
              className={activeSection === 'constraints' ? 'active' : ''}
              onClick={() => setActiveSection('constraints')}
            >
              <FaCode /> Constraints
            </button>
          </div>

          <div className="challenge-content">
            {activeSection === 'description' && (
              <>
                <h2>{challenges[0].title}</h2>
                <div className={`difficulty-badge ${challenges[0].difficulty}`}>
                  {challenges[0].difficulty}
                </div>
                <p>{challenges[0].description}</p>

                <div className="test-cases">
                  <h3>Test Cases:</h3>
                  {challenges[0].testCases.map((test, index) => (
                    <div key={index} className="test-case">
                      <div>Input: {test.input}</div>
                      <div>Expected Output: {test.output}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'explanation' && (
              <div className="challenge-explanation">
                <h3>Problem Explanation</h3>
                <p>{challenges[0].explanation}</p>
              </div>
            )}

            {activeSection === 'constraints' && (
              <div className="challenge-constraints">
                <h3>Problem Constraints</h3>
                <ul>
                  {challenges[0].constraints.map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="code-editor-section">
          <div className="editor-header">
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="theme-selector"
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
            </select>
          </div>

          <div className={`code-editor ${theme}`}>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              spellCheck="false"
            />
          </div>

          <div className="editor-actions">
            <button onClick={handleRunTests} className="run-button">
              <FaCode /> Run Tests
            </button>
            <button onClick={handleSubmit} className="submit-button">
              <FaCheck /> Submit Solution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingPortal;
