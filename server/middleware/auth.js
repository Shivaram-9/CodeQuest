const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user object to request
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token, access denied' 
      });
    }
    
    // Special handling for demo token
    if (token === 'demo-token-12345') {
      // Set demo user info
      req.user = {
        id: 'demo-user-id',
        username: 'CodeMaster',
        role: 'user'
      };
      return next();
    }
    
    // Verify regular token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user with matching ID
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({ 
          success: false, 
          message: 'User account is inactive' 
        });
      }
      
      // Add user to request object
      req.user = {
        id: user._id,
        username: user.username,
        role: user.role
      };
      
      // Update last active timestamp
      user.lastActive = Date.now();
      await user.save();
      
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

module.exports = auth;