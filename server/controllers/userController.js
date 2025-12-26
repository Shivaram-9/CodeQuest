const User = require('../models/User');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

/**
 * Get user profile by username
 * GET /api/users/:username
 */
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username })
      .select('-password -email -preferences');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get additional user statistics
    const solvedProblems = await Problem.find({ _id: { $in: user.solvedProblems } })
      .select('title difficulty tags');
    
    const attemptedProblems = await Problem.find({ 
      _id: { $in: user.attemptedProblems },
      _id: { $nin: user.solvedProblems }
    }).select('title difficulty tags');
    
    // Get submission stats (language distribution, etc)
    const submissionStats = await Submission.aggregate([
      { $match: { user: user._id } },
      { $group: {
        _id: '$language',
        count: { $sum: 1 },
        acceptedCount: { 
          $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] } 
        }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Format language distribution data
    const languageDistribution = submissionStats.map(item => ({
      language: item._id,
      count: item.count,
      acceptedCount: item.acceptedCount,
      acceptanceRate: item.count > 0 ? (item.acceptedCount / item.count) * 100 : 0
    }));
    
    // Get submission activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivity = await Submission.aggregate([
      { 
        $match: { 
          user: user._id,
          submittedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
        totalSolved: user.totalSolved,
        streak: user.streak,
        badges: user.badges,
        joinedAt: user.joinedAt,
        lastActive: user.lastActive,
        stats: {
          solvedProblems: {
            count: solvedProblems.length,
            problems: solvedProblems
          },
          attemptedProblems: {
            count: attemptedProblems.length,
            problems: attemptedProblems
          },
          languageDistribution,
          recentActivity
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
      error: error.message
    });
  }
};

/**
 * Get leaderboard
 * GET /api/users/leaderboard
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get top users by problems solved
    const users = await User.find()
      .sort({ totalSolved: -1, 'streak.current': -1 })
      .skip(skip)
      .limit(limit)
      .select('username name avatar totalSolved streak badges');
    
    const totalUsers = await User.countDocuments();
    
    return res.status(200).json({
      success: true,
      leaderboard: users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard',
      error: error.message
    });
  }
};

/**
 * Get top streaks
 * GET /api/users/streaks
 */
exports.getTopStreaks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get users with top current streaks
    const topStreaks = await User.find()
      .sort({ 'streak.current': -1, totalSolved: -1 })
      .limit(limit)
      .select('username name avatar streak.current totalSolved');
    
    return res.status(200).json({
      success: true,
      topStreaks
    });
  } catch (error) {
    console.error('Get top streaks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching top streaks',
      error: error.message
    });
  }
}; 