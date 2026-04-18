import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

// Shared socket client for project pages.
const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export default socket;
