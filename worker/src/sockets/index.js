const roomSocket = require('./room.socket');
const chatSocket = require('./chat.socket');
const matchSocket = require('./match.socket');
const submissionSocket = require('./submission.socket');
const disconnectSocket = require('./disconnect.socket');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    roomSocket(io, socket);
    chatSocket(io, socket);
    matchSocket(io, socket);
    submissionSocket(io, socket);
    disconnectSocket(io, socket);
  });
};