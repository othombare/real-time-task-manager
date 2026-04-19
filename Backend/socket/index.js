const { Server } = require("socket.io");
const { registerSocketHandlers } = require("./registerSocketHandlers");

const createSocketServer = (httpServer, allowedOrigins = []) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    },
  });

  registerSocketHandlers(io);

  return io;
};

module.exports = {
  createSocketServer,
};
