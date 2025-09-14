const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    testCaseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    passed: {
        type: Boolean,
        required: true
    },
    output: mongoose.Schema.Types.Mixed,
    expectedOutput: mongoose.Schema.Types.Mixed,
    executionTime: {
        type: Number,  // in milliseconds
        default: 0
    },
    error: {
        type: String,
        default: null
    }
});

const submissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        enum: ['javascript', 'python', 'java', 'cpp'],
        required: true
    },
    isFullProgram: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Processing'],
        default: 'Processing'
    },
    testResults: [testResultSchema],
    passedTestCases: {
        type: Number,
        default: 0
    },
    totalTestCases: {
        type: Number,
        default: 0
    },
    executionTime: {
        type: Number,  // in milliseconds
        default: 0
    },
    memoryUsed: {
        type: Number,  // in MB
        default: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate the number of passed test cases and set the status
submissionSchema.pre('save', function(next) {
    if (this.testResults && this.testResults.length > 0) {
        this.totalTestCases = this.testResults.length;
        this.passedTestCases = this.testResults.filter(result => result.passed).length;
        
        // Calculate total execution time
        this.executionTime = this.testResults.reduce((total, result) => total + (result.executionTime || 0), 0);
        
        // Set status based on test results
        if (this.passedTestCases === this.totalTestCases) {
            this.status = 'Accepted';
        } else {
            const hasRuntimeError = this.testResults.some(result => result.error && !result.error.includes('Time Limit Exceeded'));
            const hasTimeLimitExceeded = this.testResults.some(result => result.error && result.error.includes('Time Limit Exceeded'));
            
            if (hasRuntimeError) {
                this.status = 'Runtime Error';
            } else if (hasTimeLimitExceeded) {
                this.status = 'Time Limit Exceeded';
            } else {
                this.status = 'Wrong Answer';
            }
        }
    }
    next();
});

// Indexes for efficient querying
submissionSchema.index({ user: 1, problem: 1 });
submissionSchema.index({ problem: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ submittedAt: -1 });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;