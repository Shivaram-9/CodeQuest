const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Register a new user
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    // Check password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.username === username
          ? 'Username already taken'
          : 'Email already registered'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      name: name || username
    });

    // Save user to database
    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    // Return user data and token
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

/**
 * Login a user
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check for demo credentials
    if (email === '1234' && password === '1234') {
      // Create demo user object
      const demoUser = {
        id: 'demo-user-id',
        username: 'CodeMaster',
        email: '1234',
        name: 'Demo User',
        role: 'user',
        // Add other properties a real user would have
        totalPoints: 1250,
        rank: 42,
        level: 'Intermediate'
      };

      // Generate JWT token
      const token = jwt.sign(
        { id: demoUser.id, username: demoUser.username, role: demoUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return demo user data and token
      return res.status(200).json({
        success: true,
        token,
        user: demoUser
      });
    }

    // Find user by email
    console.log(`Attempting to find user with email: ${email}`);
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Your account is inactive. Please contact support.'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    // Update last active timestamp
    user.lastActive = Date.now();
    await user.save();

    // Return user data and token
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

/**
 * Get the current user
 * GET /api/auth/me
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
        totalSolved: user.totalSolved,
        streak: user.streak,
        badges: user.badges,
        preferences: user.preferences,
        joinedAt: user.joinedAt,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user data',
      error: error.message
    });
  }
};

/**
 * Update user profile
 * PUT /api/auth/me
 */
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, bio, avatar, preferences } = req.body;

    // Update only allowable fields
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;
    
    // Update preferences if provided
    if (preferences) {
      if (preferences.theme) user.preferences.theme = preferences.theme;
      if (preferences.codeEditor) {
        const { fontSize, tabSize, keyMap } = preferences.codeEditor;
        if (fontSize) user.preferences.codeEditor.fontSize = fontSize;
        if (tabSize) user.preferences.codeEditor.tabSize = tabSize;
        if (keyMap) user.preferences.codeEditor.keyMap = keyMap;
      }
      if (typeof preferences.emailNotifications === 'boolean') {
        user.preferences.emailNotifications = preferences.emailNotifications;
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message
    });
  }
};

/**
 * Change password
 * PUT /api/auth/password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Check password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error changing password',
      error: error.message
    });
  }
};