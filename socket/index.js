const { Server } = require("socket.io");
const jwt = require('jsonwebtoken');
const conversationHandler = require("../utils/conversationHandler");
const messageHandler = require("../utils/messageHandler");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // frontend
      methods: ["GET", "POST"],
    },
  });

  // Authenticate socket connection with JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; 
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    // Handlers
    conversationHandler(io, socket);
    messageHandler(io, socket);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  return io;
}


module.exports = initSocket;