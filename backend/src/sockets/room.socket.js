const { roomParticipants } = require('./state');

module.exports = (io, socket) => {
  socket.on('join_room', ({ roomId, userId, username, avatarEmoji }) => {
    socket.join(roomId);

    if (!roomParticipants[roomId]) {
      roomParticipants[roomId] = [];
    }

    const exists = roomParticipants[roomId].find(
      p => p.userId === userId
    );

    if (!exists) {
      roomParticipants[roomId].push({
        userId,
        username,
        socketId: socket.id,
        avatarEmoji
      });
    } else {
      exists.socketId = socket.id;
      exists.avatarEmoji = avatarEmoji;
    }

    io.to(roomId).emit('user_joined', { userId, username });
    io.to(roomId).emit(
      'participants_update',
      roomParticipants[roomId]
    );
  });
};