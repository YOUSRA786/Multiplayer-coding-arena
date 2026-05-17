const Room = require('../models/Room');
const Problem = require('../models/Problem');
const { generateRandomProblem } = require('../services/aiProblemGenerator');

const createRoom = async (req, res) => {
  try {
    let problemId;

    // Try AI generation first
    try {
      const generatedData = await generateRandomProblem();
      const problem = await Problem.create(generatedData);
      problemId = problem._id;
    } catch (aiErr) {
      console.error("CRITICAL: AI generation failed. Details:", aiErr);
      // Fallback: pick random from DB
      const randomProblems = await Problem.aggregate([{ $sample: { size: 1 } }]);
      if (randomProblems && randomProblems.length > 0) {
        console.log("Using DB fallback problem:", randomProblems[0].title);
        problemId = randomProblems[0]._id;
      } else {
        console.error("CRITICAL: DB fallback also failed. Problem table might be empty.");
      }
    }

    if (!problemId) {
      return res.status(500).json({ message: 'No problems available.' });
    }

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const room = await Room.create({
      roomId,
      host: req.user._id,
      problemId,
      players: [{ user: req.user._id, status: 'waiting' }]
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId }).populate('players.user', 'username rating').populate('problemId');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRoom, getRoom };
