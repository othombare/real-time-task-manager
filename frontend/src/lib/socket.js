import { io } from "socket.io-client";

const inferSocketUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:3000";
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3000`;
};

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || inferSocketUrl();

// Shared socket client for project pages.
const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export default socket;
