const { Server } = require('socket.io');

// Map of userId -> Set of socketId
const userSockets = new Map();
let ioInstance = null;

function init(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`Socket conectado: ${socket.id}`);

    socket.on('register', (userId) => {
      if (!userId) return;
      const uId = parseInt(userId);
      socket.userId = uId;
      
      if (!userSockets.has(uId)) {
        userSockets.set(uId, new Set());
      }
      userSockets.get(uId).add(socket.id);
      console.log(`Usuário ${uId} registrado no socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket desconectado: ${socket.id}`);
      if (socket.userId && userSockets.has(socket.userId)) {
        const sockets = userSockets.get(socket.userId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(socket.userId);
        }
        console.log(`Usuário ${socket.userId} removido do socket ${socket.id}`);
      }
    });
  });

  return ioInstance;
}

function sendToUser(userId, event, data) {
  const uId = parseInt(userId);
  if (userSockets.has(uId)) {
    const sockets = userSockets.get(uId);
    sockets.forEach(socketId => {
      if (ioInstance) {
        ioInstance.to(socketId).emit(event, data);
      }
    });
    return true;
  }
  return false;
}

function broadcast(event, data) {
  if (ioInstance) {
    ioInstance.emit(event, data);
  }
}

module.exports = {
  init,
  sendToUser,
  broadcast
};
