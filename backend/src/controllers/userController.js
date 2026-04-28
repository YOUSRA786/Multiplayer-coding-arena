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
    const mongoose = require('mongoose');
    
    const matchStats = await Submission.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$roomId",
          bestResult: {
            $max: {
              $cond: [{ $eq: ["$result", "Accepted"] }, 1, 0]
            }
          },
          lastSubmissionTime: { $first: "$createdAt" }
        }
      },
      { $sort: { lastSubmissionTime: -1 } }
    ]);

    const matchesPlayed = matchStats.length;
    const wins = matchStats.filter(m => m.bestResult === 1).length;

    let winStreak = 0;
    for (const match of matchStats) {
      if (match.bestResult === 1) winStreak++;
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
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const history = await Submission.find({ 
      userId,
      createdAt: { $gte: threeDaysAgo }
    })
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
