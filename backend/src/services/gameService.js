const redis = require('../config/redis');
const Room = require('../models/Room');
const Problem = require('../models/Problem');
const MatchResult = require('../models/MatchResult');
const { generateRandomProblem } = require('./aiProblemGenerator');

const GAME_KEY_PREFIX = 'game:';
const ROUND_TIME = 120; // 120 seconds per round
const SCORING = [100, 70, 50, 30, 10]; // 1st, 2nd, 3rd, 4th, 5th

const memoryState = new Map();

class GameService {
  async getGameState(roomId) {
    try {
      if (redis.isOpen && redis.isReady) {
        const data = await redis.get(GAME_KEY_PREFIX + roomId);
        if (data) return JSON.parse(data);
      }
      return memoryState.get(roomId) || null;
    } catch (err) {
      return memoryState.get(roomId) || null;
    }
  }

  async saveGameState(roomId, state) {
    memoryState.set(roomId, state);
    try {
      if (redis.isOpen && redis.isReady) {
        await redis.set(GAME_KEY_PREFIX + roomId, JSON.stringify(state), {
          EX: 3600 
        });
      }
    } catch (err) {
      console.warn("Redis save failed, using memory fallback");
    }
  }

  async startGame(roomId, totalRounds = 3) {
    const room = await Room.findOne({ roomId }).populate('players.user');
    if (!room) throw new Error('Room not found');

    const initialState = {
      roomId,
      status: 'waiting',
      round: 0,
      totalRounds,
      currentProblemId: null,
      roundStartTime: null,
      roundEndTime: null,
      usedProblemIds: [], // Track problems used in this session
      solvedUsers: [], // Array of { userId, timeTaken }
      scores: {}, // Map of userId -> score
      players: room.players
        .filter(p => p.user) // Filter out any players where user didn't populate
        .map(p => ({
          userId: p.user._id.toString(),
          username: p.user.username || 'Unknown'
        }))
    };

    // Initialize scores
    initialState.players.forEach(p => {
      initialState.scores[p.userId] = 0;
    });

    await this.saveGameState(roomId, initialState);
    return this.startRound(roomId);
  }

  async startRound(roomId) {
    const state = await this.getGameState(roomId);
    if (!state) throw new Error('Game state not found');

    state.round += 1;
    state.status = 'in_round';
    state.solvedUsers = [];
    
    let problem;
    // Get titles of problems already used in this room to avoid duplicates
    const excludeTitles = state.usedProblemIds || [];

    // Pick a new problem (AI first)
    try {
      const generatedData = await generateRandomProblem(excludeTitles);
      problem = await Problem.create(generatedData);
      state.currentProblemId = problem._id.toString();
      // Track this problem's title for future rounds
      if (!state.usedProblemIds) state.usedProblemIds = [];
      state.usedProblemIds.push(problem.title);
    } catch (err) {
      console.error("AI failed for game round, using DB fallback:", err.message);
      // DB Fallback: filter out used problems if possible
      const randomProblems = await Problem.aggregate([
        { $match: { title: { $nin: excludeTitles } } },
        { $sample: { size: 1 } }
      ]);
      
      if (randomProblems.length > 0) {
        problem = await Problem.findById(randomProblems[0]._id);
        state.currentProblemId = problem._id.toString();
        state.usedProblemIds.push(problem.title);
      }
    }

    if (!problem) throw new Error('Could not find or generate a problem');

    // Calculate duration based on difficulty
    // Easy: 5min (300s), Medium: 10min (600s), Hard: 20min (1200s)
    let durationSeconds = 300; // Default Easy
    if (problem.difficulty === 'medium') durationSeconds = 600;
    else if (problem.difficulty === 'hard') durationSeconds = 1200;

    state.roundStartTime = Date.now();
    state.roundEndTime = state.roundStartTime + (durationSeconds * 1000);

    await this.saveGameState(roomId, state);
    return state;
  }

  async handleSolve(roomId, userId) {
    const state = await this.getGameState(roomId);
    if (!state || state.status !== 'in_round') return null;

    // Prevent duplicate solves
    if (state.solvedUsers.some(u => u.userId === userId)) return null;

    const timeTaken = (Date.now() - state.roundStartTime) / 1000;
    state.solvedUsers.push({ userId, timeTaken });

    // Assign points based on rank
    const rank = state.solvedUsers.length;
    const points = SCORING[rank - 1] || 10;
    state.scores[userId] = (state.scores[userId] || 0) + points;

    await this.saveGameState(roomId, state);

    // If all players solved, we can end round early
    const allSolved = state.solvedUsers.length === state.players.length;
    
    return { state, userId, points, allSolved };
  }

  async endRound(roomId) {
    const state = await this.getGameState(roomId);
    if (!state || state.status !== 'in_round') return null;

    state.status = 'round_end';
    await this.saveGameState(roomId, state);
    return state;
  }

  async nextRound(roomId) {
    const state = await this.getGameState(roomId);
    if (!state) return null;

    if (state.round >= state.totalRounds) {
      return this.endGame(roomId);
    } else {
      return this.startRound(roomId);
    }
  }

  async endGame(roomId) {
    const state = await this.getGameState(roomId);
    if (!state) return null;

    state.status = 'game_end';
    
    // Find winner
    let winnerId = null;
    let maxScore = -1;
    const finalScores = [];

    for (const [userId, score] of Object.entries(state.scores)) {
      finalScores.push({ userId, score });
      if (score > maxScore) {
        maxScore = score;
        winnerId = userId;
      }
    }

    // Sort final scores for ranking
    finalScores.sort((a, b) => b.score - a.score);
    const rankedPlayers = finalScores.map((s, idx) => {
      const pInfo = state.players.find(p => p.userId === s.userId);
      return {
        userId: s.userId,
        username: pInfo?.username || 'Unknown',
        score: s.score,
        rank: idx + 1
      };
    });

    // Persist to MongoDB
    await MatchResult.create({
      roomId,
      players: rankedPlayers,
      totalRounds: state.round,
      winner: winnerId,
      status: 'completed'
    });

    // Update Room status
    await Room.findOneAndUpdate({ roomId }, { status: 'finished' });

    await this.saveGameState(roomId, state);
    return { state, rankedPlayers, winnerId };
  }
}

module.exports = new GameService();
