const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  expected: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  explanation: {
    type: String,
    required: false 
  },
  isHidden: {
    type: Boolean,
    default: false
  }
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  constraints: {
    type: String,
    required: true
  },
  inputFormat: {
    type: String,
    required: true
  },
  outputFormat: {
    type: String,
    required: true
  },
  sampleInput: {
    type: String,
    required: true
  },
  sampleOutput: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: false
  },
  hints: [{
    type: String
  }],
  testCases: [testCaseSchema],
  tags: [{
    type: String,
    trim: true
  }],
  timeLimit: {
    type: Number,
    default: 1000 // milliseconds
  },
  memoryLimit: {
    type: Number,
    default: 128 // MB
  },
  starterCode: {
    javascript: {
      type: String,
      default: ""
    },
    python: {
      type: String,
      default: ""
    },
    java: {
      type: String,
      default: ""
    },
    cpp: {
      type: String,
      default: ""
    }
  },
  solutionCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },
  relatedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  solvedCount: {
    type: Number,
    default: 0
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 0
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
problemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate success rate before saving
problemSchema.pre('save', function(next) {
  if (this.totalSubmissions > 0) {
    this.successRate = (this.solvedCount / this.totalSubmissions) * 100;
  }
  next();
});

// Indexes for efficient querying
problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ title: 'text', description: 'text' });

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem; 