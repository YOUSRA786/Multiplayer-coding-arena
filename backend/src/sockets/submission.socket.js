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

    } catch (err) {
      socket.emit('submission_error', {
        message: err.message
      });
    }
  });
};