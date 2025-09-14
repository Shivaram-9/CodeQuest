const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true
    },
    output: {
        type: String,
        required: true
    },
    explanation: String
});

const challengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true,
        min: 0
    },
    testCases: [testCaseSchema],
    constraints: [String],
    explanation: String,
    starterCode: {
        type: String,
        default: ''
    },
    solution: {
        type: String,
        required: true
    },
    timeLimit: {
        type: Number,
        default: 2000 // milliseconds
    },
    memoryLimit: {
        type: Number,
        default: 256 // MB
    },
    completionRate: {
        type: Number,
        default: 0
    },
    totalSubmissions: {
        type: Number,
        default: 0
    },
    successfulSubmissions: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamps on save
challengeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate completion rate before saving
challengeSchema.pre('save', function(next) {
    if (this.totalSubmissions > 0) {
        this.completionRate = (this.successfulSubmissions / this.totalSubmissions) * 100;
    }
    next();
});

module.exports = mongoose.model('Challenge', challengeSchema);