const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const auth = require('../middleware/auth');

// Get all challenges with filters
router.get('/', async (req, res) => {
    try {
        const { difficulty, topic, search } = req.query;
        const query = {};

        if (difficulty && difficulty !== 'all') {
            query.difficulty = difficulty.toLowerCase();
        }

        if (topic && topic !== 'all') {
            query.topic = topic.toLowerCase();
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const challenges = await Challenge.find(query)
            .select('-solution') // Don't send solution to client
            .sort({ difficulty: 1, completionRate: -1 });

        res.json(challenges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific challenge
router.get('/:id', async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id)
            .select('-solution'); // Don't send solution to client

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        res.json(challenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new challenge (admin only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const challenge = new Challenge({
            title: req.body.title,
            description: req.body.description,
            difficulty: req.body.difficulty,
            topic: req.body.topic,
            points: req.body.points,
            testCases: req.body.testCases,
            constraints: req.body.constraints,
            explanation: req.body.explanation,
            starterCode: req.body.starterCode,
            solution: req.body.solution,
            timeLimit: req.body.timeLimit,
            memoryLimit: req.body.memoryLimit
        });

        const newChallenge = await challenge.save();
        res.status(201).json(newChallenge);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a challenge (admin only)
router.patch('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        Object.keys(req.body).forEach(key => {
            if (key in challenge) {
                challenge[key] = req.body[key];
            }
        });

        const updatedChallenge = await challenge.save();
        res.json(updatedChallenge);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a challenge (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        await challenge.remove();
        res.json({ message: 'Challenge deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;