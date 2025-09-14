const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const auth = require('../middleware/auth');

// Get user's learning progress
router.get('/progress', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('completedChallenges totalPoints rank level streak learningPath badges')
            .populate('completedChallenges', 'title difficulty points');

        // Calculate completion statistics
        const totalChallenges = await Challenge.countDocuments();
        const completionRate = (user.completedChallenges.length / totalChallenges) * 100;

        // Get weekly progress
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        
        const weeklyProgress = await User.aggregate([
            {
                $match: { _id: user._id }
            },
            {
                $lookup: {
                    from: 'submissions',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$user', '$$userId'] },
                                        { $gte: ['$submittedAt', weekStart] },
                                        { $eq: ['$status', 'accepted'] }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: { $dayOfWeek: '$submittedAt' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    as: 'weeklySubmissions'
                }
            }
        ]);

        res.json({
            completedChallenges: user.completedChallenges,
            totalPoints: user.totalPoints,
            rank: user.rank,
            level: user.level,
            streak: user.streak,
            learningPath: user.learningPath,
            badges: user.badges,
            completionRate,
            weeklyProgress: weeklyProgress[0]?.weeklySubmissions || []
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's ranking
router.get('/ranking', auth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const userRank = await User.countDocuments({
            totalPoints: { $gt: req.user.totalPoints }
        });

        // Get top performers
const topUsers = await User.find()
            .select('username totalPoints rank level')
            .sort({ totalPoints: -1 })
            .limit(10);

        res.json({
            currentRank: userRank + 1,
            totalUsers,
            topUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get recommended challenges
router.get('/recommendations', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('completedChallenges level');

        // Get challenges not completed by user
        const recommendations = await Challenge.find({
            _id: { $nin: user.completedChallenges },
            difficulty: getDifficultyForLevel(user.level)
        })
        .select('title difficulty points completionRate topic')
        .sort({ completionRate: -1 })
        .limit(3);

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user's learning path
router.patch('/learning-path', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.learningPath = {
            ...user.learningPath,
            ...req.body
        };

        await user.save();
        res.json(user.learningPath);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Award badge to user
router.post('/badges', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if badge already exists
        const badgeExists = user.badges.some(badge => badge.name === req.body.name);
        if (badgeExists) {
            return res.status(400).json({ message: 'Badge already awarded' });
        }

        user.badges.push({
            name: req.body.name,
            description: req.body.description,
            icon: req.body.icon
        });

        await user.save();
        res.status(201).json(user.badges);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Helper function to determine challenge difficulty based on user level
function getDifficultyForLevel(level) {
    switch (level.toLowerCase()) {
        case 'beginner':
            return 'easy';
        case 'intermediate':
            return 'medium';
        case 'advanced':
            return 'hard';
        default:
            return ['easy', 'medium'];
    }
}

module.exports = router;