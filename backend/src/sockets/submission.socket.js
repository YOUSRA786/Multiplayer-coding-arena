const submissionService = require('../services/submissionService');

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
        io.to(payload.roomId).emit('player_won', { username: payload.username });
      }

    } catch (err) {
      socket.emit('submission_error', {
        message: err.message
      });
    }
  });
};