/**
 * Admin authentication middleware
 * Checks if the authenticated user has admin role
 * Must be used after the auth middleware
 */
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

module.exports = adminAuth; 