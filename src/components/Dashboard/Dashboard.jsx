import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCode, FaBook, FaTrophy, FaLightbulb, FaFire, FaChartLine, 
  FaMedal, FaClock, FaCalendarAlt, FaGraduationCap, FaRegThumbsUp, 
  FaStar, FaPlus, FaRandom, FaDice, FaFilter, FaUser, FaArrowRight
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [userProgress, setUserProgress] = useState({
    username: 'Shashank',
    completedChallenges: 15,
    totalPoints: 1250,
    currentStreak: 7,
    level: 'Intermediate',
    rank: 342,
    totalUsers: 1500,
    weeklyProgress: [25, 40, 60, 75, 85, 95, 100],
    badges: [
      { name: 'Algorithm Master', icon: <FaCode />, date: '2024-03-15' },
      { name: 'Streak Champion', icon: <FaFire />, date: '2024-03-10' },
      { name: 'Problem Solver', icon: <FaLightbulb />, date: '2024-03-05' }
    ]
  });

  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [currentChallenge, setCurrentChallenge] = useState({
    title: 'Binary Search Implementation',
    id: 'bst-101',
    progress: 65
  });
  
  const motivationalQuotes = [
    "The only way to learn a new programming language is by writing programs in it.",
    "Code is like humor. When you have to explain it, it's bad.",
    "Experience is the name everyone gives to their mistakes.",
    "Programming isn't about what you know; it's about what you can figure out.",
    "The most disastrous thing that you can ever learn is your first programming language."
  ];
  
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  
  const recommendedChallenges = [
    {
      title: 'Binary Search Implementation',
      id: 'bst-101',
      difficulty: 'Medium',
      points: 100,
      category: 'Algorithms',
      completionRate: '75%',
      estimatedTime: '30 mins',
      isInProgress: true,
      progress: 65
    },
    {
      title: 'Dynamic Programming Basics',
      difficulty: 'Hard',
      id: 'dp-201',
      points: 150,
      category: 'Algorithms',
      completionRate: '45%',
      estimatedTime: '45 mins',
      isInProgress: false,
      progress: 0
    },
    {
      title: 'Tree Traversal',
      id: 'tree-103',
      difficulty: 'Easy',
      points: 80,
      category: 'Data Structures',
      completionRate: '85%',
      estimatedTime: '20 mins',
      isInProgress: false,
      progress: 0
    },
    {
      title: 'HashMap Implementation',
      id: 'hmap-301',
      difficulty: 'Medium',
      points: 120,
      category: 'Data Structures',
      completionRate: '60%',
      estimatedTime: '35 mins',
      isInProgress: false,
      progress: 0
    },
    {
      title: 'Dijkstra\'s Algorithm',
      id: 'graph-405',
      difficulty: 'Hard',
      points: 200,
      category: 'Algorithms',
      completionRate: '40%',
      estimatedTime: '60 mins',
      isInProgress: false,
      progress: 0
    },
    {
      title: 'Linked List Cycle Detection',
      id: 'll-207',
      difficulty: 'Easy',
      points: 75,
      category: 'Data Structures',
      completionRate: '80%',
      estimatedTime: '25 mins',
      isInProgress: false,
      progress: 0
    }
  ];

  const learningPaths = [
    {
      title: 'Data Structures Mastery',
      progress: 60,
      nextLesson: 'Graph Algorithms',
      totalLessons: 12,
      completedLessons: 7,
      estimatedTimeLeft: '3 hours'
    },
    {
      title: 'Algorithm Specialization',
      progress: 45,
      nextLesson: 'Dynamic Programming',
      totalLessons: 15,
      completedLessons: 6,
      estimatedTimeLeft: '5 hours'
    }
  ];

  const recentActivity = [
    {
      type: 'challenge',
      title: 'Array Manipulation',
      time: '2 hours ago',
      points: 50,
      icon: <FaCode />
    },
    {
      type: 'badge',
      title: 'Algorithm Master',
      time: 'Yesterday',
      icon: <FaMedal />
    },
    {
      type: 'streak',
      title: '7 Day Streak Achieved',
      time: '2 days ago',
      icon: <FaFire />
    },
    {
      type: 'learning',
      title: 'Created Custom Learning Path',
      time: '3 days ago',
      icon: <FaGraduationCap />
    }
  ];
  
  const generateRandomChallenge = () => {
    const filteredChallenges = recommendedChallenges.filter(challenge => 
      selectedDifficulty === 'all' || challenge.difficulty.toLowerCase() === selectedDifficulty
    );
    const randomIndex = Math.floor(Math.random() * filteredChallenges.length);
    return filteredChallenges[randomIndex];
  };
  
  const handleRandomChallenge = () => {
    const challenge = generateRandomChallenge();
    // In a real app, redirect to the challenge page
    alert(`Random challenge selected: ${challenge.title} (${challenge.difficulty})`);
  };
  
  useEffect(() => {
    // Rotate motivational quotes every 10 seconds
    const quoteInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setCurrentQuote(motivationalQuotes[randomIndex]);
    }, 10000);
    
    return () => clearInterval(quoteInterval);
  }, []);

  return (
    <div className="dashboard-container">
      <div className="welcome-banner">
        <div className="welcome-content">
          <div className="user-greeting">
            <div className="avatar-container">
              <div className="user-avatar">{userProgress.username.charAt(0)}</div>
              {userProgress.currentStreak >= 5 && (
                <div className="avatar-badge">
                  <FaFire className="streak-flame" />
                </div>
              )}
            </div>
            <div className="greeting-text">
              <h2>Welcome back, {userProgress.username}!</h2>
              <div className="streak-info">
                <FaFire className="streak-icon" />
                <span className="streak-count">{userProgress.currentStreak} day streak!</span>
                <span className="streak-message">Keep it going!</span>
              </div>
            </div>
          </div>
          <div className="motivational-quote">
            <FaLightbulb className="quote-icon" />
            <p className="quote-text">"{currentQuote}"</p>
          </div>
        </div>
        <div className="quick-stats">
          <div className="quick-stat-item">
            <FaChartLine />
            <span>Rank #{userProgress.rank} of {userProgress.totalUsers}</span>
          </div>
          <div className="quick-stat-item">
            <FaClock />
            <span>4 hours coded this week</span>
          </div>
          <div className="quick-stat-item">
            <FaCalendarAlt />
            <span>Next goal: 2 days</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card practice-card">
          <div className="card-header">
            <h3><FaCode className="card-icon" /> Practice Challenges</h3>
            <div className="difficulty-filter">
              <FaFilter className="filter-icon" />
              <select 
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          
          {currentChallenge && (
            <div className="continue-challenge">
              <h4>Continue where you left off</h4>
              <div className="current-challenge">
                <div className="challenge-info">
                  <h5>{currentChallenge.title}</h5>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${currentChallenge.progress}%` }}
                    >
                      <span className="progress-text">{currentChallenge.progress}%</span>
                    </div>
                  </div>
                </div>
                <Link to={`/practice/${currentChallenge.id}`} className="continue-btn">
                  Continue <FaArrowRight />
                </Link>
              </div>
            </div>
          )}
          
          <div className="challenges-list">
            <h4>Suggested for you</h4>
            {recommendedChallenges
              .filter(challenge => selectedDifficulty === 'all' || challenge.difficulty.toLowerCase() === selectedDifficulty)
              .slice(0, 3)
              .map((challenge, index) => (
                <div key={index} className="challenge-item">
                  <div className="challenge-header">
                    <h5>{challenge.title}</h5>
                    <span className={`difficulty ${challenge.difficulty.toLowerCase()}`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <div className="challenge-meta">
                    <span>{challenge.points} points</span>
                    <span>{challenge.completionRate} completion rate</span>
                    <span>{challenge.estimatedTime}</span>
                  </div>
                  <Link to={`/practice/${challenge.id}`} className="start-challenge-btn">
                    {challenge.isInProgress ? 'Continue' : 'Start Challenge'}
                  </Link>
                </div>
            ))}
          </div>
          
          <div className="random-challenge">
            <button className="random-btn" onClick={handleRandomChallenge}>
              <FaDice /> Generate Random Challenge
            </button>
            <p className="random-help">Feeling adventurous? Try a random challenge based on your selected difficulty.</p>
          </div>
          
          <Link to="/practice" className="view-all-link">
            View All Challenges <FaArrowRight />
          </Link>
        </div>

        <div className="dashboard-card stats-card">
          <h3><FaTrophy className="card-icon" /> Your Progress</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{userProgress.completedChallenges}</span>
              <span className="stat-label">Challenges Completed</span>
              <div className="stat-progress">
                <div className="progress-bar" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-value">{userProgress.totalPoints}</span>
              <span className="stat-label">Total Points</span>
              <div className="stat-progress">
                <div className="progress-bar" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-value">{userProgress.level}</span>
              <span className="stat-label">Current Level</span>
              <div className="stat-progress">
                <div className="progress-bar" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
          <div className="weekly-progress">
            <h4>Weekly Progress</h4>
            <div className="progress-chart">
              {userProgress.weeklyProgress.map((value, index) => (
                <div 
                  key={index} 
                  className="progress-bar-vertical" 
                  style={{ height: `${value}%` }}
                >
                  <span className="progress-label">{value}%</span>
                </div>
              ))}
            </div>
            <div className="progress-labels">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3><FaBook className="card-icon" /> Learning Paths</h3>
            <Link to="/learn" className="view-all">View All</Link>
          </div>
          <div className="learning-paths-list">
            {learningPaths.map((path, index) => (
              <div key={index} className="learning-path-item">
                <div className="path-header">
                  <h4>{path.title}</h4>
                  <span className="lessons-count">
                    {path.completedLessons}/{path.totalLessons} lessons
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${path.progress}%` }}
                  >
                    <span className="progress-text">{path.progress}%</span>
                  </div>
                </div>
                <div className="path-footer">
                  <span>Next: {path.nextLesson}</span>
                  <span>{path.estimatedTimeLeft} left</span>
                </div>
                <Link to={`/learn/${index}`} className="continue-learning-btn">
                  Continue Learning
                </Link>
              </div>
            ))}
            <Link to="/learn" className="create-path-link">
              <div className="create-path-btn">
                <span>Create Custom Learning Path</span>
                <FaPlus />
              </div>
            </Link>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3><FaChartLine className="card-icon" /> Recent Activity</h3>
            <button className="filter-btn">Filter</button>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.icon}
                </div>
                <div className="activity-details">
                  <p className="activity-title">{activity.title}</p>
                  <span className="activity-time">{activity.time}</span>
                  {activity.points && <span className="activity-points">+{activity.points} points</span>}
                </div>
              </div>
            ))}
          </div>
          <Link to="/profile/activity" className="view-all-link">
            View All Activity
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
