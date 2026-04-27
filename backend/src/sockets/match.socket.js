const Room = require('../models/Room');

module.exports = (io, socket) => {
  socket.on('start_match', async ({ roomId }) => {
    try {
      const room = await Room.findOne({ roomId }).populate('problemId');

      if (!room) return;

      room.status = 'in_progress';
      room.startTime = new Date();

      await room.save();

      io.to(roomId).emit('match_started', {
        problem: room.problemId,
        startTime: room.startTime
      });

    } catch (err) {
      console.error(err);
    }
  });
};