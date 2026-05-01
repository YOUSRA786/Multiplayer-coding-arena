const mongoose = require('mongoose');

const practiceLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate entries for same user + same problem
practiceLogSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const PracticeLog = mongoose.model('PracticeLog', practiceLogSchema);
module.exports = PracticeLog;
