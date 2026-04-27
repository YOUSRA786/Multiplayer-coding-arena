const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['waiting', 'ready', 'playing', 'finished'], default: 'waiting' },
    score: { type: Number, default: 0 }
  }],
  status: { type: String, enum: ['waiting', 'in_progress', 'finished'], default: 'waiting' },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  startTime: { type: Date }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
