let ioInstance = null;

module.exports = {
  init: (server) => {
    const socketIo = require('socket.io');
    ioInstance = socketIo(server);
    return ioInstance;
  },
  getIO: () => {
    if (!ioInstance) {
      throw new Error('Socket.io not initialized!');
    }
    return ioInstance;
  }
};