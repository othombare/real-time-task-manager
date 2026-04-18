import { io } from "socket.io-client";

// Shared socket client for project pages.
const socket = io("http://localhost:3000", {
  withCredentials: true,
});

export default socket;
