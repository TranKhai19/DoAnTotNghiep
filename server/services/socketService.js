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

function emitNoTien(payload) {
  // payload example: { title: 'Nổ tiền', amount: 1000, campaignId: 1 }
  if (!io) {
    console.warn('Socket.io not initialized - cannot emit no_tien');
    return;
  }
  try {
    io.emit('no_tien', payload);
  } catch (e) {
    console.error('Failed to emit no_tien event:', e);
  }
}

module.exports = {
  init,
  getIo
  ,emitNoTien
};
