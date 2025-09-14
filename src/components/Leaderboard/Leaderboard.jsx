import React, { useState } from 'react';
import { 
  FaTrophy, FaMedal, FaSearch, FaFire, FaChartLine, 
  FaCrown, FaStar, FaAward, FaUserFriends,
  FaChartBar, FaCode, FaStopwatch
} from 'react-icons/fa';
import './Leaderboard.css';

const Leaderboard = () => {
  const [timeFilter, setTimeFilter] = useState('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState('global');
  
  const [leaderboardData, setLeaderboardData] = useState([
    {
      rank: 1,
      username: 'CodeMaster',
      points: 15000,
      challengesSolved: 120,
      streak: 30,
      badge: '🏆 Algorithm Expert',
      badges: ['Algorithm Master', 'Streak Champion', '100 Days', 'DP Guru'],
      progress: 95
    },
    {
      rank: 2,
      username: 'PythonPro',
      points: 14500,
      challengesSolved: 115,
      streak: 25,
      badge: '🌟 Problem Solver',
      badges: ['Python Expert', 'Contributor', 'Graph Master'],
      progress: 88
    },
    {
      rank: 3,
      username: 'JavaScriptNinja',
      points: 13800,
      challengesSolved: 108,
      streak: 20,
      badge: '⚡ Speed Coder',
      progress: 82
    },
    {
      rank: 4,
      username: 'AlgorithmAce',
      points: 12500,
      challengesSolved: 95,
      streak: 18,
      badge: '📊 Data Wizard',
      progress: 78
    },
    {
      rank: 5,
      username: 'CodeNinja',
      points: 11800,
      challengesSolved: 90,
      streak: 15,
      badge: '🚀 Rising Star',
      progress: 75
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'algorithms', name: 'Algorithms' },
    { id: 'dataStructures', name: 'Data Structures' },
    { id: 'frontend', name: 'Frontend' },
    { id: 'backend', name: 'Backend' }
  ];

  const filterLeaderboard = () => {
    let filtered = [...leaderboardData];
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <div className="header-content">
          <h2><FaTrophy className="trophy-icon" /> Leaderboard</h2>
          <p>Compete with other developers and climb the ranks!</p>
        </div>
        
        <div className="leaderboard-filters">
          <div className="filter-group">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="category-filter"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="time-filter"
            >
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="allTime">All Time</option>
            </select>

            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'global' ? 'active' : ''}`}
                onClick={() => setViewMode('global')}
              >
                <FaUserFriends /> Global
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'friends' ? 'active' : ''}`}
                onClick={() => setViewMode('friends')}
              >
                <FaUserFriends /> Friends
              </button>
            </div>
          </div>

          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="top-performers">
        {filterLeaderboard().slice(0, 3).map((user, index) => (
          <div key={index} className={`top-performer rank-${index + 1}`}>
            <div className="rank-badge">
              {index === 0 && <FaCrown className="gold" />}
              {index === 1 && <FaMedal className="silver" />}
              {index === 2 && <FaMedal className="bronze" />}
            </div>
            <div className="performer-avatar">
              {user.username.charAt(0)}
            </div>
            <div className="performer-info">
              <h3>{user.username}</h3>
              <div className="performer-stats">
                <span><FaTrophy /> {user.points} pts</span>
                <span><FaFire /> {user.streak} days</span>
              </div>
              <div className="performer-badges">
                {user.badges && user.badges.map((badge, i) => (
                  <span key={i} className="badge-tag">
                    <FaAward /> {badge}
                  </span>
                ))}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${user.progress}%` }}
                >
                  <span className="progress-text">{user.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="leaderboard-table">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Points</th>
              <th>Challenges</th>
              <th>Streak</th>
              <th>Badges</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {filterLeaderboard().map((user, index) => (
              <tr key={index} className="leaderboard-row">
                <td className="rank">#{user.rank}</td>
                <td className="user-cell">
                  <div className="user-avatar">{user.username.charAt(0)}</div>
                  <div className="user-info">
                    <span className="username">{user.username}</span>
                    <span className="badge">{user.badge}</span>
                  </div>
                </td>
                <td className="points">
                  <FaTrophy className="points-icon" />
                  {user.points.toLocaleString()}
                </td>
                <td className="challenges">
                  <FaChartLine className="challenges-icon" />
                  {user.challengesSolved}
                </td>
                <td className="streak">
                  <FaFire className="streak-icon" />
                  <span className="streak-value">{user.streak} days</span>
                </td>
                <td className="badges">
                  {user.badges && 
                    <div className="badges-container">
                      <div className="badge-count">
                        <FaAward className="badge-icon" />
                        {user.badges.length}
                      </div>
                      <div className="badge-tooltip">
                        {user.badges.map((badge, i) => (
                          <span key={i} className="badge-item">
                            <FaAward /> {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  }
                </td>
                <td className="progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${user.progress}%` }}
                    />
                  </div>
                  <span className="progress-text">{user.progress}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="your-ranking">
        <div className="your-rank-card">
          <h3>Your Current Ranking</h3>
          <div className="rank-info">
            <div className="rank-stat">
              <FaTrophy className="stat-icon" />
              <div className="stat-content">
                <span className="label">Rank</span>
                <span className="value">#42</span>
              </div>
            </div>
            <div className="rank-stat">
              <FaChartLine className="stat-icon" />
              <div className="stat-content">
                <span className="label">Points</span>
                <span className="value">8,750</span>
              </div>
            </div>
            <div className="rank-stat">
              <FaStar className="stat-icon" />
              <div className="stat-content">
                <span className="label">To Next Rank</span>
                <span className="value">250 pts</span>
              </div>
            </div>
          </div>
          <button className="view-profile-btn">View Full Profile</button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
