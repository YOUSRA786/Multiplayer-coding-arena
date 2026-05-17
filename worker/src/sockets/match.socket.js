const Room = require('../models/Room');
const Problem = require('../models/Problem');
const gameService = require('../services/gameService');

const timers = new Map();

module.exports = (io, socket) => {
  socket.on('start_match', async ({ roomId, rounds = 3 }) => {
    try {
      const state = await gameService.startGame(roomId, rounds);
      const problem = await Problem.findById(state.currentProblemId);

      io.to(roomId).emit('game_started', state);
      io.to(roomId).emit('round_started', {
        round: state.round,
        problem,
        endTime: state.roundEndTime
      });

      // Set round timer
      startRoundTimer(roomId, state.roundEndTime - Date.now());
    } catch (err) {
      console.error(err);
      socket.emit('error', { message: 'Failed to start game' });
    }
  });

  socket.on('next_round', async ({ roomId }) => {
    try {
      const state = await gameService.nextRound(roomId);
      if (!state) return;

      if (state.status === 'game_end') {
        const result = await gameService.endGame(roomId);
        io.to(roomId).emit('game_ended', result);
      } else {
        const problem = await Problem.findById(state.currentProblemId);
        io.to(roomId).emit('round_started', {
          round: state.round,
          problem,
          endTime: state.roundEndTime
        });
        startRoundTimer(roomId, state.roundEndTime - Date.now());
      }
    } catch (err) {
      console.error(err);
    }
  });

  async function startRoundTimer(roomId, duration) {
    if (timers.has(roomId)) clearTimeout(timers.get(roomId));

    const timer = setTimeout(async () => {
      const state = await gameService.endRound(roomId);
      if (state) {
        io.to(roomId).emit('round_ended', state);
      }
    }, duration);

    timers.set(roomId, timer);
  }

  // Handle sudden round completion (all players solved)
  socket.on('check_round_end', async ({ roomId }) => {
    const state = await gameService.getGameState(roomId);
    if (state && state.status === 'in_round' && state.solvedUsers.length === state.players.length) {
      if (timers.has(roomId)) clearTimeout(timers.get(roomId));
      const endState = await gameService.endRound(roomId);
      io.to(roomId).emit('round_ended', endState);
    }
  });
};