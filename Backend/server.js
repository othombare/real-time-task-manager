const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config({ path: './config.env' });

const app = require('./app');

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Setup Socket.IO with proper CORS
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // ⚠️ don't use "*" in production
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

// ✅ Make io globally accessible (works, but not best practice)
global.io = io;

// ✅ Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Example custom event
  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
    console.log(`User joined project ${projectId}`);
  });

  socket.on("leaveProject", (projectId) => {
    socket.leave(projectId);
    console.log(`User left project ${projectId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// 🔗 MongoDB connection
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB)
.then(() => console.log('DB connection successful!'))
.catch(err => console.log('DB connection error:', err.message));

// ✅ Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
