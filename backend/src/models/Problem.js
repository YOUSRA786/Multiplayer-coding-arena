const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  examples: [{
    input: { type: String },
    output: { type: String },
    explanation: { type: String }
  }],
  constraints: [{ type: String }],
  boilerplateCode: {
    python: { type: String },
    cpp: { type: String },
    java: { type: String }
  },
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
  }]
}, { timestamps: true });

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;
