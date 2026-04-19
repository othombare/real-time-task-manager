const onlineUsers = new Map();
const socketToUser = new Map();

const normalizeId = (value) => String(value || "").trim();

const removeSocketFromUser = (userId, socketId) => {
  const userSockets = onlineUsers.get(userId);

  if (!userSockets) {
    return false;
  }

  userSockets.delete(socketId);

  if (userSockets.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }

  return false;
};

const addUserSocket = (userId, socketId) => {
  const normalizedUserId = normalizeId(userId);
  const normalizedSocketId = normalizeId(socketId);

  if (!normalizedUserId || !normalizedSocketId) {
    return {
      userId: null,
      becameOnline: false,
      previousUserId: null,
      previousUserBecameOffline: false,
    };
  }

  const previousUserId = socketToUser.get(normalizedSocketId) || null;
  let previousUserBecameOffline = false;

  // Handle socket re-auth/login switch without waiting for disconnect.
  if (previousUserId && previousUserId !== normalizedUserId) {
    previousUserBecameOffline = removeSocketFromUser(previousUserId, normalizedSocketId);
  }

  socketToUser.set(normalizedSocketId, normalizedUserId);

  let userSockets = onlineUsers.get(normalizedUserId);
  const wasOffline = !userSockets || userSockets.size === 0;

  if (!userSockets) {
    userSockets = new Set();
    onlineUsers.set(normalizedUserId, userSockets);
  }

  userSockets.add(normalizedSocketId);

  return {
    userId: normalizedUserId,
    becameOnline: wasOffline,
    previousUserId,
    previousUserBecameOffline,
  };
};

const removeSocket = (socketId) => {
  const normalizedSocketId = normalizeId(socketId);
  const userId = socketToUser.get(normalizedSocketId);

  if (!userId) {
    return {
      userId: null,
      becameOffline: false,
    };
  }

  socketToUser.delete(normalizedSocketId);
  const becameOffline = removeSocketFromUser(userId, normalizedSocketId);

  return {
    userId,
    becameOffline,
  };
};

const isUserOnline = (userId) => onlineUsers.has(normalizeId(userId));

const getOnlineUserIds = () => Array.from(onlineUsers.keys());

module.exports = {
  addUserSocket,
  removeSocket,
  isUserOnline,
  getOnlineUserIds,
};
