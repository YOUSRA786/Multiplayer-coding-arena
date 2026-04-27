const User = require('../models/User');
const Submission = require('../models/Submission');
const Room = require('../models/Room');

const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find().sort({ rating: -1 }).limit(10).select('username rating');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Total Matches Played (Distinct rooms where user submitted code)
    const distinctRooms = await Submission.distinct('roomId', { userId });
    const matchesPlayed = distinctRooms.length || 0;

    // Total Wins (Number of accepted submissions)
    const wins = await Submission.countDocuments({ userId, result: 'Accepted' });

    // Recent submissions to calculate win streak
    const recentSubs = await Submission.find({ userId }).sort({ createdAt: -1 }).limit(10);
    let winStreak = 0;
    for (const sub of recentSubs) {
      if (sub.result === 'Accepted') winStreak++;
      else break;
    }

    res.json({
      matchesPlayed,
      wins,
      ratingChange: "+24", // Placeholder for actual ELO calculation
      winStreak
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await Submission.find({ userId })
      .populate('problemId', 'title difficulty')
      .populate('roomId', 'roomId')
      .sort({ createdAt: -1 })
      .limit(10);
      
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard, getStats, getHistory };
