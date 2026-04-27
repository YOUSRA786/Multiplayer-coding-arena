const { roomParticipants } = require('./state');

module.exports = (io, socket) => {
  socket.on('disconnect', () => {
    for (const roomId in roomParticipants) {
      const index = roomParticipants[roomId].findIndex(
        p => p.socketId === socket.id
      );

      if (index !== -1) {
        roomParticipants[roomId].splice(index, 1);

        io.to(roomId).emit(
          'participants_update',
          roomParticipants[roomId]
        );
      }
    }
  });
};