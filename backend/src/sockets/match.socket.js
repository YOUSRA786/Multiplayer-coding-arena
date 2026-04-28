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

  socket.on('next_round', async ({ roomId }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) return;

      const Problem = require('../models/Problem');
      const { generateRandomProblem } = require('../services/aiProblemGenerator');

      try {
        const generatedData = await generateRandomProblem();
        const problem = await Problem.create(generatedData);
        
        room.problemId = problem._id;
        room.startTime = new Date();
        await room.save();

        const populatedRoom = await Room.findOne({ roomId }).populate('problemId');
        
        io.to(roomId).emit('match_started', {
          problem: populatedRoom.problemId,
          startTime: populatedRoom.startTime,
          isNextRound: true
        });
      } catch (aiError) {
        console.error("AI Generation failed for next round:", aiError);
      }
    } catch (err) {
      console.error(err);
    }
  });
};