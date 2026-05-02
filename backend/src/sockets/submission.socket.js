const submissionService = require('../services/submissionService');
const gameService = require('../services/gameService');

module.exports = (io, socket) => {
  socket.on('submit_code', async (payload) => {
    try {
      const result = await submissionService.handleSubmission(payload);

      io.to(payload.roomId).emit(
        'leaderboard_update',
        result.leaderboard
      );

      socket.emit(
        'submission_result',
        result.response
      );

      if (result.response.result === 'Accepted') {
        io.to(payload.roomId).emit('player_solved', { 
          username: payload.username,
          points: result.solveResult?.points || 0
        });

        // Check if round should end early (all players solved)
        if (result.solveResult?.allSolved) {
          const endState = await gameService.endRound(payload.roomId);
          io.to(payload.roomId).emit('round_ended', endState);
        }
      }

    } catch (err) {
      socket.emit('submission_error', {
        message: err.message
      });
    }
  });
};