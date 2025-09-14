import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './components/Dashboard/Dashboard'
import CodingPortal from './components/CodingPortal/CodingPortal'
import Leaderboard from './components/Leaderboard/Leaderboard'
import Profile from './components/Profile/Profile'
import LearningHub from './components/LearningHub/LearningHub'
import Practice from './components/Practice/Practice'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import './css/variables.css'
import './css/components.css'
import './App.css'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user prefers dark mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.setAttribute('data-theme', newDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  // Apply the theme on initial load
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Check for existing auth token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // For demo login, automatically authenticate
      if (token === 'demo-token-12345') {
        setIsAuthenticated(true);
        setUser({
          id: 'demo-user-id',
          username: 'CodeMaster',
          email: '1234',
          name: 'Demo User',
          role: 'user'
        });
        return;
      }

      // For real token, verify with backend
      fetch('/api/auth/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => {
        // If verification fails, try to use as demo login
        if (token === 'demo-token-12345') {
          setIsAuthenticated(true);
          setUser({
            id: 'demo-user-id',
            username: 'CodeMaster',
            email: '1234',
            name: 'Demo User',
            role: 'user'
          });
        } else {
          localStorage.removeItem('token');
        }
      });
    }
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        {/* Navigation Header */}
        <nav className="navbar">
          <Link to="/" className="nav-brand">CodeQuest</Link>
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/" className="nav-item">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-item">Dashboard</Link>
                <Link to="/practice" className="nav-item">Practice</Link>
                <Link to="/learn" className="nav-item">Learning Hub</Link>
                <Link to="/leaderboard" className="nav-item">Leaderboard</Link>
                <Link to="/profile" className="nav-item">Profile</Link>
                <button onClick={handleLogout} className="nav-item logout-btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-item">Login</Link>
                <Link to="/register" className="nav-item">Register</Link>
              </>
            )}
            <button 
              className="theme-toggle"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
          <div 
            className="nav-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={
            <main className="main-content">
              <section className="hero-section">
                <h1>Welcome to CodeQuest</h1>
                <p>Embark on your coding journey</p>
                <Link to={isAuthenticated ? "/practice" : "/login"} className="cta-button">
                  {isAuthenticated ? "Start Coding" : "Sign In to Start"}
                </Link>
              </section>

              <section className="features-section">
                <div className="feature-card">
                  <h3>Learn</h3>
                  <p>Interactive coding lessons</p>
                </div>
                <div className="feature-card">
                  <h3>Practice</h3>
                  <p>Real-world challenges</p>
                </div>
                <div className="feature-card">
                  <h3>Compete</h3>
                  <p>Join coding competitions</p>
                </div>
              </section>
            </main>
          } />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
          <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/learn" element={<LearningHub />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>About CodeQuest</h4>
              <p>Your journey to coding mastery starts here</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <Link to="/learn">Learning Paths</Link>
              <Link to="/practice">Coding Challenges</Link>
              <Link to="/leaderboard">Leaderboard</Link>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <a href="#" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="#" target="_blank" rel="noopener noreferrer">Discord</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 CodeQuest. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
