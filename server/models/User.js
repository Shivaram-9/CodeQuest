const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    dateEarned: {
        type: Date,
        default: Date.now
    },
    icon: String
});

const submissionHistorySchema = new mongoose.Schema({
    challengeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        required: true
    },
    status: {
        type: String,
        enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error'],
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    executionTime: Number,
    memoryUsed: Number,
    code: String
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    name: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        maxlength: 500
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    totalSolved: {
        type: Number,
        default: 0
    },
    solvedProblems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    }],
    attemptedProblems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    }],
    streak: {
        current: {
            type: Number,
            default: 0
        },
        longest: {
            type: Number,
            default: 0
        },
        lastSubmissionDate: {
            type: Date,
            default: null
        }
    },
    dailySubmissionCounts: [{
        date: Date,
        count: Number
    }],
    badges: [{
        type: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'streak', 'problems', 'accuracy']
        },
        name: String,
        description: String,
        earnedAt: {
            type: Date,
            default: Date.now
        }
    }],
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        codeEditor: {
            fontSize: {
                type: Number,
                default: 14
            },
            tabSize: {
                type: Number,
                default: 2
            },
            keyMap: {
                type: String,
                enum: ['default', 'vim', 'emacs'],
                default: 'default'
            }
        },
        emailNotifications: {
            type: Boolean,
            default: true
        }
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Update streak on submission
userSchema.methods.updateStreak = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!this.streak.lastSubmissionDate) {
        // First submission
        this.streak.current = 1;
        this.streak.longest = 1;
        this.streak.lastSubmissionDate = today;
        return;
    }
    
    const lastDate = new Date(this.streak.lastSubmissionDate);
    lastDate.setHours(0, 0, 0, 0);
    
    const daysDifference = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) {
        // Already submitted today
        return;
    } else if (daysDifference === 1) {
        // Consecutive day
        this.streak.current += 1;
        if (this.streak.current > this.streak.longest) {
            this.streak.longest = this.streak.current;
        }
    } else {
        // Streak broken
        this.streak.current = 1;
    }
    
    this.streak.lastSubmissionDate = today;
};

// Method to compare password for login
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate auth token
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { id: this._id, username: this.username, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Method to update last active timestamp
userSchema.methods.updateLastActive = async function() {
    this.lastActive = Date.now();
    await this.save();
};

// Method to record a daily submission
userSchema.methods.recordSubmission = async function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRecord = this.dailySubmissionCounts.find(
        record => new Date(record.date).toISOString().split('T')[0] === today.toISOString().split('T')[0]
    );
    
    if (todayRecord) {
        todayRecord.count += 1;
    } else {
        this.dailySubmissionCounts.push({ date: today, count: 1 });
    }
    
    await this.save();
};

// Indexes for efficient querying
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ totalSolved: -1 });
userSchema.index({ 'streak.current': -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;