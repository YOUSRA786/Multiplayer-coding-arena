const axios = require('axios');
const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const Room = require('../models/Room');

// Simple in-memory scores for the prototype
const roomScores = {};

const handleSubmission = async ({
  roomId,
  userId,
  username,
  problemId,
  code,
  language
}) => {
  if (!problemId || !mongoose.Types.ObjectId.isValid(problemId)) {
    throw new Error('Invalid or missing problem ID. Please start the match again.');
  }

  const problem = await Problem.findById(problemId);
  if (!problem) {
    throw new Error('Problem not found.');
  }

  const room = await Room.findOne({ roomId });
  if (!room) {
    throw new Error('Room not found.');
  }

  // Execute Code
  let data;
  try {
    const res = await axios.post("http://localhost:5001/execute", {
      code,
      language,
      testCases: problem.testCases
    });
    data = res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Code execution service failed');
  }

  const resultsArray = data.results || [];
  const passedCount = resultsArray.filter(r => r.passed).length;
  const totalCount = resultsArray.length || problem.testCases.length;
  const result = passedCount === totalCount && totalCount > 0 ? 'Accepted' : 'Wrong Answer';

  const formattedResponse = {
    result,
    passedCount,
    totalCount,
    details: resultsArray
  };

  // Save Submission using the MongoDB _id for the room
  await Submission.create({
    userId,
    roomId: room._id,
    problemId,
    code,
    language,
    result,
    testCasesPassed: passedCount,
    totalTestCases: totalCount
  });

  // Calculate Leaderboard
  if (!roomScores[roomId]) {
    roomScores[roomId] = {};
  }
  
  if (result === 'Accepted') {
    // Award 100 points per accepted submission (could be logic based on time)
    roomScores[roomId][username] = (roomScores[roomId][username] || 0) + 100;
  }

  const leaderboard = Object.keys(roomScores[roomId]).map(user => ({
    username: user,
    score: roomScores[roomId][user]
  })).sort((a, b) => b.score - a.score);

  return {
    leaderboard,
    response: formattedResponse
  };
};

module.exports = { handleSubmission };