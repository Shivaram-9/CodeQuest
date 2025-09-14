import React, { useState } from 'react';
import { 
  FaUser, FaCog, FaCode, FaTrophy, FaChartLine, FaGithub, 
  FaLinkedin, FaStar, FaMedal, FaFire, FaBrain, FaBook, 
  FaRobot, FaRegLightbulb, FaCalendarCheck, FaChartBar, FaPlus, FaClock
} from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);

  const userProfile = {
    name: 'Shashank',
    username: 'CodeMaster',
    email: 'john@example.com',
    joinDate: 'January 2025',
    bio: 'Passionate programmer | AI Enthusiast | Full Stack Developer',
    skills: ['Python', 'JavaScript', 'React', 'Node.js', 'Data Structures', 'Algorithms', 'Databases'],
    achievements: [
      { title: 'Algorithm Master', description: 'Solved 100 algorithm challenges', icon: <FaTrophy />, date: '2024-03-15' },
      { title: 'Streak Master', description: '30 days coding streak', icon: <FaFire />, date: '2024-03-10' },
      { title: 'Problem Solver', description: 'Helped 50 community members', icon: <FaStar />, date: '2024-03-05' },
      { title: 'AI Champion', description: 'Completed AI-assisted learning path', icon: <FaBrain />, date: '2024-03-20' }
    ],
    recentActivity: [
      { type: 'challenge', title: 'Binary Search Tree Implementation', date: '2 days ago', points: 100 },
      { type: 'achievement', title: 'Earned Algorithm Master Badge', date: '1 week ago' },
      { type: 'contribution', title: 'Helped solve a DP problem', date: '3 days ago', points: 50 },
      { type: 'learning', title: 'Created custom DSA learning path', date: '4 days ago' }
    ],
    stats: {
      totalPoints: 15000,
      challengesSolved: 120,
      contributions: 45,
      currentStreak: 30,
      aiScore: 92
    },
    submissions: [
      { id: 1, title: 'Two Sum', difficulty: 'Easy', status: 'Accepted', date: '2024-05-01', language: 'JavaScript', runtime: '76ms', memory: '42.3MB' },
      { id: 2, title: 'Valid Parentheses', difficulty: 'Easy', status: 'Accepted', date: '2024-04-28', language: 'Python', runtime: '32ms', memory: '14.2MB' },
      { id: 3, title: 'Merge Two Sorted Lists', difficulty: 'Easy', status: 'Accepted', date: '2024-04-25', language: 'Java', runtime: '0ms', memory: '39.5MB' },
      { id: 4, title: 'Maximum Subarray', difficulty: 'Medium', status: 'Wrong Answer', date: '2024-04-20', language: 'JavaScript', runtime: '-', memory: '-' },
      { id: 5, title: 'LRU Cache', difficulty: 'Hard', status: 'Accepted', date: '2024-04-15', language: 'C++', runtime: '468ms', memory: '164.2MB' },
      { id: 6, title: 'Climbing Stairs', difficulty: 'Easy', status: 'Time Limit Exceeded', date: '2024-04-10', language: 'Python', runtime: '-', memory: '-' }
    ],
    detailedActivity: [
      { date: '2024-05-02', activities: [
        { type: 'challenge', title: 'Solved "Binary Tree Level Order Traversal"', time: '14:30', points: 120 },
        { type: 'learning', title: 'Completed lesson on Graph Algorithms', time: '16:45' }
      ]},
      { date: '2024-05-01', activities: [
        { type: 'challenge', title: 'Solved "Two Sum"', time: '09:15', points: 50 },
        { type: 'forum', title: 'Helped user with recursion problem', time: '11:20', points: 25 },
        { type: 'contest', title: 'Participated in Weekly Contest', time: '20:00', points: 150 }
      ]},
      { date: '2024-04-30', activities: [
        { type: 'learning', title: 'Started Advanced Algorithms path', time: '13:45' },
        { type: 'challenge', title: 'Attempted "Median of Two Sorted Arrays"', time: '17:30', points: 0, status: 'Failed' }
      ]}
    ],
    performanceInsights: {
      strongTopics: ['Arrays', 'Strings', 'Hash Tables', 'Binary Trees'],
      weakTopics: ['Dynamic Programming', 'Graph Theory', 'Advanced Math'],
      solveTimeByDifficulty: {
        easy: '5 mins',
        medium: '25 mins',
        hard: '60+ mins'
      },
      accuracyRate: {
        overall: '78%',
        easy: '95%',
        medium: '72%',
        hard: '45%'
      },
      weeklyProgress: [5, 8, 12, 7, 10, 15, 8],
      topLanguages: [
        { name: 'JavaScript', percentage: 45 },
        { name: 'Python', percentage: 35 },
        { name: 'Java', percentage: 15 },
        { name: 'C++', percentage: 5 }
      ]
    },
    learningPaths: [
      {
        title: 'Data Structures Mastery',
        progress: 75,
        lastActive: '2 days ago',
        isCustomized: true
      },
      {
        title: 'Advanced Algorithms',
        progress: 50,
        lastActive: '1 week ago',
        isCustomized: false
      },
      {
        title: 'Full Stack Development',
        progress: 30,
        lastActive: '3 days ago',
        isCustomized: true
      }
    ],
    aiInsights: {
      strengths: ['Array manipulation', 'Tree traversal', 'Dynamic Programming'],
      areasToImprove: ['Graph algorithms', 'Bit manipulation'],
      recommendedProblems: [
        { title: 'Course Schedule (Topological Sort)', difficulty: 'Medium' },
        { title: 'Number of Islands (DFS/BFS)', difficulty: 'Medium' },
        { title: 'Bit Manipulation Basics', difficulty: 'Easy' }
      ],
      learningRate: {
        lastMonth: '+15%',
        overall: 'Faster than 85% of users'
      }
    }
  };

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-info">
          <div className="profile-avatar">{userProfile.name.charAt(0)}</div>
          <div className="profile-details">
            <h1>{userProfile.name}</h1>
            <p className="username">@{userProfile.username}</p>
            <p className="bio">{userProfile.bio}</p>
            <div className="profile-social">
              <a href="#" className="social-link"><FaGithub /> GitHub</a>
              <a href="#" className="social-link"><FaLinkedin /> LinkedIn</a>
            </div>
          </div>
          <div className="profile-actions">
            <div className="ai-score-badge">
              <FaBrain />
              <span>AI Score: {userProfile.stats.aiScore}</span>
            </div>
            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
              <FaCog /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Profile Navigation */}
      <div className="profile-nav">
        <button 
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaUser /> Overview
        </button>
        <button 
          className={`nav-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <FaChartLine /> Activity
        </button>
        <button 
          className={`nav-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <FaTrophy /> Achievements
        </button>
        <button 
          className={`nav-btn ${activeTab === 'learning' ? 'active' : ''}`}
          onClick={() => setActiveTab('learning')}
        >
          <FaBook /> Learning
        </button>
        <button 
          className={`nav-btn ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          <FaCode /> Submissions
        </button>
        <button 
          className={`nav-btn ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <FaRegLightbulb /> Insights
        </button>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              {Object.entries(userProfile.stats).map(([key, value]) => (
                <div key={key} className="stat-card">
                  <h3>{key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')}</h3>
                  <div className="stat-value">
                    {value}
                    {key === 'aiScore' && (
                      <span className="ai-label"><FaBrain /></span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="skills-section">
              <h3>Skills & Expertise</h3>
              <div className="skills-grid">
                {userProfile.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>

            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-timeline">
                {userProfile.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'challenge' && <FaCode />}
                      {activity.type === 'achievement' && <FaTrophy />}
                      {activity.type === 'contribution' && <FaUser />}
                      {activity.type === 'learning' && <FaBook />}
                    </div>
                    <div className="activity-details">
                      <p className="activity-title">{activity.title}</p>
                      <span className="activity-date">{activity.date}</span>
                      {activity.points && <span className="activity-points">+{activity.points} points</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-section">
            <div className="achievements-grid">
              {userProfile.achievements.map((achievement, index) => (
                <div key={index} className="achievement-card">
                  <div className="achievement-icon">{achievement.icon}</div>
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                  <span className="achievement-date">{achievement.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'learning' && (
          <div className="learning-section">
            <div className="section-header">
              <h3>Learning Paths</h3>
              <button className="create-path-btn">
                <FaPlus /> Create Custom Path
              </button>
            </div>
            <div className="learning-paths-grid">
              {userProfile.learningPaths.map((path, index) => (
                <div key={index} className="learning-path-card">
                  <div className="path-header">
                    <h3>{path.title}</h3>
                    {path.isCustomized && (
                      <span className="customized-badge">
                        <FaStar /> Customized
                      </span>
                    )}
                  </div>
                  <div className="path-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${path.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{path.progress}% Complete</span>
                  </div>
                  <div className="path-footer">
                    <span className="last-active">Last active: {path.lastActive}</span>
                    <button className="continue-btn">Continue Learning</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-section">
            <div className="section-header">
              <h3>Activity Timeline</h3>
              <div className="activity-filters">
                <select className="activity-filter">
                  <option value="all">All Activity</option>
                  <option value="challenges">Challenges</option>
                  <option value="learning">Learning</option>
                  <option value="social">Social</option>
                </select>
              </div>
            </div>
            
            <div className="detailed-activity">
              {userProfile.detailedActivity.map((day, dayIndex) => (
                <div key={dayIndex} className="activity-day">
                  <div className="day-header">
                    <h4>{day.date}</h4>
                  </div>
                  <div className="day-activities">
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className={`activity-item ${activity.status === 'Failed' ? 'failed' : ''}`}>
                        <div className="activity-time">{activity.time}</div>
                        <div className="activity-icon">
                          {activity.type === 'challenge' && <FaCode />}
                          {activity.type === 'learning' && <FaBook />}
                          {activity.type === 'forum' && <FaUser />}
                          {activity.type === 'contest' && <FaTrophy />}
                        </div>
                        <div className="activity-details">
                          <p className="activity-title">{activity.title}</p>
                          {activity.points !== undefined && (
                            <span className={`activity-points ${activity.points === 0 ? 'zero' : ''}`}>
                              {activity.points > 0 ? '+' : ''}{activity.points} points
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button className="load-more-btn">Load More Activity</button>
          </div>
        )}
        
        {activeTab === 'submissions' && (
          <div className="submissions-section">
            <div className="section-header">
              <h3>Problem Submissions</h3>
              <div className="submission-filters">
                <select className="submission-filter">
                  <option value="all">All Submissions</option>
                  <option value="accepted">Accepted</option>
                  <option value="wrong">Wrong Answer</option>
                  <option value="tle">Time Limit Exceeded</option>
                </select>
                <select className="difficulty-filter">
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            
            <div className="submissions-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Difficulty</th>
                    <th>Status</th>
                    <th>Language</th>
                    <th>Runtime</th>
                    <th>Memory</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userProfile.submissions.map((submission, index) => (
                    <tr key={index} className={`submission-row ${submission.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      <td>{submission.title}</td>
                      <td>
                        <span className={`difficulty ${submission.difficulty.toLowerCase()}`}>
                          {submission.difficulty}
                        </span>
                      </td>
                      <td className={`status ${submission.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {submission.status}
                      </td>
                      <td>{submission.language}</td>
                      <td>{submission.runtime}</td>
                      <td>{submission.memory}</td>
                      <td>{submission.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="pagination">
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <button className="page-btn">Next</button>
            </div>
          </div>
        )}
        
        {activeTab === 'insights' && (
          <div className="insights-section">
            <div className="insights-header">
              <div className="insights-icon">
                <FaChartLine />
              </div>
              <div className="insights-title">
                <h3>Performance Insights</h3>
                <p>Statistics and analysis of your coding journey</p>
              </div>
            </div>

            <div className="insights-grid">
              <div className="insight-card">
                <h4><FaRegLightbulb /> Strong Topics</h4>
                <ul className="strength-list">
                  {userProfile.performanceInsights.strongTopics.map((topic, index) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>

              <div className="insight-card">
                <h4><FaChartBar /> Areas to Improve</h4>
                <ul className="improvement-list">
                  {userProfile.performanceInsights.weakTopics.map((topic, index) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>

              <div className="insight-card">
                <h4><FaClock /> Average Solve Time</h4>
                <div className="solve-times">
                  <div className="solve-time-item">
                    <span className="difficulty easy">Easy</span>
                    <span className="time">{userProfile.performanceInsights.solveTimeByDifficulty.easy}</span>
                  </div>
                  <div className="solve-time-item">
                    <span className="difficulty medium">Medium</span>
                    <span className="time">{userProfile.performanceInsights.solveTimeByDifficulty.medium}</span>
                  </div>
                  <div className="solve-time-item">
                    <span className="difficulty hard">Hard</span>
                    <span className="time">{userProfile.performanceInsights.solveTimeByDifficulty.hard}</span>
                  </div>
                </div>
              </div>

              <div className="insight-card">
                <h4><FaCode /> Preferred Languages</h4>
                <div className="language-stats">
                  {userProfile.performanceInsights.topLanguages.map((lang, index) => (
                    <div key={index} className="language-bar">
                      <span className="language-name">{lang.name}</span>
                      <div className="language-progress">
                        <div 
                          className="language-fill"
                          style={{ width: `${lang.percentage}%` }}
                        ></div>
                      </div>
                      <span className="language-percentage">{lang.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="insight-card wide-card">
                <h4><FaChartLine /> Weekly Progress</h4>
                <div className="weekly-chart">
                  <div className="chart-bars">
                    {userProfile.performanceInsights.weeklyProgress.map((value, index) => (
                      <div key={index} className="chart-bar-column">
                        <div 
                          className="chart-bar" 
                          style={{ height: `${(value / Math.max(...userProfile.performanceInsights.weeklyProgress)) * 100}%` }}
                        ></div>
                        <span className="chart-value">{value}</span>
                        <span className="chart-label">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="insight-card wide-card">
                <h4><FaRegLightbulb /> Accuracy Rate</h4>
                <div className="accuracy-stats">
                  <div className="accuracy-circle">
                    <svg viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#eee"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#4caf50"
                        strokeWidth="3"
                        strokeDasharray={`${parseInt(userProfile.performanceInsights.accuracyRate.overall)}, 100`}
                      />
                      <text x="18" y="20.35" textAnchor="middle" fill="#444" fontSize="10">
                        {userProfile.performanceInsights.accuracyRate.overall}
                      </text>
                    </svg>
                    <span className="accuracy-label">Overall</span>
                  </div>
                  <div className="accuracy-details">
                    <div className="accuracy-item">
                      <span className="difficulty easy">Easy</span>
                      <div className="accuracy-bar">
                        <div 
                          className="accuracy-fill easy-fill"
                          style={{ width: userProfile.performanceInsights.accuracyRate.easy }}
                        ></div>
                      </div>
                      <span className="accuracy-value">{userProfile.performanceInsights.accuracyRate.easy}</span>
                    </div>
                    <div className="accuracy-item">
                      <span className="difficulty medium">Medium</span>
                      <div className="accuracy-bar">
                        <div 
                          className="accuracy-fill medium-fill"
                          style={{ width: userProfile.performanceInsights.accuracyRate.medium }}
                        ></div>
                      </div>
                      <span className="accuracy-value">{userProfile.performanceInsights.accuracyRate.medium}</span>
                    </div>
                    <div className="accuracy-item">
                      <span className="difficulty hard">Hard</span>
                      <div className="accuracy-bar">
                        <div 
                          className="accuracy-fill hard-fill"
                          style={{ width: userProfile.performanceInsights.accuracyRate.hard }}
                        ></div>
                      </div>
                      <span className="accuracy-value">{userProfile.performanceInsights.accuracyRate.hard}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="edit-profile-modal">
            <h2>Edit Profile</h2>
            <form className="edit-profile-form">
              <div className="form-group">
                <label>Name</label>
                <input type="text" defaultValue={userProfile.name} />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea defaultValue={userProfile.bio}></textarea>
              </div>
              <div className="form-group">
                <label>Skills</label>
                <input type="text" defaultValue={userProfile.skills.join(', ')} />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="save-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
