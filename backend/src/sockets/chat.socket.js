module.exports = (io, socket) => {
  socket.on('chat_message', ({ roomId, username, message }) => {
    io.to(roomId).emit('chat_message', {
      username,
      message,
      timestamp: new Date()
    });
  });
};