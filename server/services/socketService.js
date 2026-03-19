let io = null;

function init(server, options = {}) {
  const { Server } = require('socket.io');
  io = new Server(server, options);

  // Basic connection log
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', socket.id, reason);
    });
  });

  return io;
}

function getIo() {
  if (!io) throw new Error('Socket.io not initialized - call init(server) first');
  return io;
}

module.exports = {
  init,
  getIo
};
