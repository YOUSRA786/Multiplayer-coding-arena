const submissionQueue = require('../queues/submissionQueue');
const { QueueEvents } = require('bullmq');
const gameService = require('../services/gameService');

// Initialize QueueEvents for waiting on the worker
const queueEvents = new QueueEvents('submissionQueue', {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379
  }
});

module.exports = (io, socket) => {
  socket.on('submit_code', async (payload) => {
    try {
      console.log(`[Socket] Queueing submission for ${payload.username}`);
      
      // Add the submission job to the BullMQ queue
      const job = await submissionQueue.add('submit', payload);

      // Wait for the separate worker container to finish processing the job
      const result = await job.waitUntilFinished(queueEvents);
      console.log(`[Socket] Submission completed for ${payload.username}`);

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
      console.error('[Socket] Submission processing error:', err.message);
      socket.emit('submission_error', {
        message: err.message || 'Submission failed in background worker.'
      });
    }
  });
};