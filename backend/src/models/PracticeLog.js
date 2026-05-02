const mongoose = require('mongoose');

const practiceLogSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic:       { type: String, required: true },
  problemSlug: { type: String, required: true },
  title:       { type: String },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

practiceLogSchema.index({ userId: 1, problemSlug: 1 }, { unique: true });

const PracticeLog = mongoose.model('PracticeLog', practiceLogSchema);
module.exports = PracticeLog;
