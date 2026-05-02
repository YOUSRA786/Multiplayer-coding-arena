const mongoose = require('mongoose');

const matchResultSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    score: Number,
    rank: Number
  }],
  totalRounds: Number,
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'completed' }
}, { timestamps: true });

module.exports = mongoose.model('MatchResult', matchResultSchema);
