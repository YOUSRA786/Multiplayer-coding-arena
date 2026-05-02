const axios = require('axios');
const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const Room = require('../models/Room');
const User = require('../models/User');
const gameService = require('./gameService');

const handleSubmission = async ({
  roomId,
  userId,
  username,
  problemId,
  code,
  language
}) => {
  const gameState = await gameService.getGameState(roomId);
  if (!gameState || gameState.status !== 'in_round') {
    throw new Error('Round is not active or match has ended.');
  }

  // Prevent duplicate solves in the same round
  if (gameState.solvedUsers.some(u => u.userId === userId)) {
    throw new Error('You have already solved this problem in this round.');
  }

  const problem = await Problem.findById(problemId);
  if (!problem) throw new Error('Problem not found.');

  const room = await Room.findOne({ roomId });
  if (!room) throw new Error('Room not found.');

  // Execute Code
  console.log(`Executing code for user ${userId} in room ${roomId}...`);
  
  // LeetCode style: Join user code with hidden test harness if available
  let codeToExecute = code;
  if (problem.testHarness && problem.testHarness[language]) {
    codeToExecute = code + "\n\n" + problem.testHarness[language];
  }

  let data;
  try {
    const res = await axios.post("http://localhost:5001/execute", {
      code: codeToExecute,
      language,
      testCases: problem.testCases
    });
    data = res.data;
    console.log('Execution successful:', data.results?.length, 'test cases run');
  } catch (error) {
    console.error('Code execution failed:', error.message);
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

  // Save Submission
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

  let solveResult = null;
  if (result === 'Accepted') {
    // Handle solve in game engine
    solveResult = await gameService.handleSolve(roomId, userId);
    
    // Increment User Rating (+10 for accepted)
    try {
      await User.findByIdAndUpdate(userId, { $inc: { rating: 10 } });
    } catch (e) {
      console.error('Rating update failed:', e);
    }
  }

  // Fetch updated game state for leaderboard
  const updatedState = await gameService.getGameState(roomId);
  const leaderboard = Object.entries(updatedState?.scores || {}).map(([uid, score]) => {
    const p = updatedState.players.find(p => p.userId === uid);
    return { username: p?.username || 'Unknown', score };
  }).sort((a, b) => b.score - a.score);

  return {
    leaderboard,
    response: formattedResponse,
    solveResult // contains points, allSolved, etc.
  };
};

module.exports = { handleSubmission };