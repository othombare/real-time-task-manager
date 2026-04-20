const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const { createSocketServer } = require("./socket");

dotenv.config({ path: "./config.env" });

const app = require("./app");

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : []),
  ...(process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",") : []),
]
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = createSocketServer(server, allowedOrigins);

global.io = io;
app.set("io", io);

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.log("DB connection error:", err.message));

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
