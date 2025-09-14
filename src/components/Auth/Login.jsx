import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = ({ setIsAuthenticated, setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simple mock authentication (accept any credentials)
      const mockUser = {
        id: 'user-' + Date.now(),
        username: formData.email,
        email: formData.email,
        name: 'User',
        role: 'user'
      };
      const mockToken = 'mock-token-' + Date.now();
      
      // Store token in localStorage
      localStorage.setItem('token', mockToken);
      
      // Update authentication state
      setIsAuthenticated(true);
      setUser(mockUser);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue coding</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Username/Email</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your username/email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          
          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;