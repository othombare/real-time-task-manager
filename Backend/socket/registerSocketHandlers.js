const mongoose = require("mongoose");
const User = require("../models/userModel");
const {
  addUserSocket,
  removeSocket,
} = require("./presenceTracker");

const safeUserId = (value) => String(value || "").trim();
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const setUserOnlineInDb = async (userId) => {
  if (!isValidObjectId(userId)) {
    return;
  }

  await User.findByIdAndUpdate(userId, { isOnline: true });
};

const setUserOfflineInDb = async (userId) => {
  const fallbackLastSeen = new Date();

  if (!isValidObjectId(userId)) {
    return fallbackLastSeen;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      isOnline: false,
      lastSeen: fallbackLastSeen,
    },
    {
      new: true,
      select: "lastSeen",
    }
  );

  return updatedUser?.lastSeen || fallbackLastSeen;
};

const emitOfflineUpdate = async (io, userId) => {
  const lastSeen = await setUserOfflineInDb(userId);

  io.emit("presence:update", {
    userId,
    status: "offline",
    lastSeen,
  });
};

const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinProject", (projectId) => {
      if (!projectId) {
        return;
      }

      socket.join(String(projectId));
      console.log(`User joined project ${projectId}`);
    });

    socket.on("leaveProject", (projectId) => {
      if (!projectId) {
        return;
      }

      socket.leave(String(projectId));
      console.log(`User left project ${projectId}`);
    });

    socket.on("userOnline", async (payload = {}) => {
      const userIdFromPayload =
        typeof payload === "string" ? payload : payload?.userId;
      const userId = safeUserId(userIdFromPayload);

      if (!userId) {
        return;
      }

      try {
        const {
          becameOnline,
          previousUserId,
          previousUserBecameOffline,
        } = addUserSocket(userId, socket.id);

        if (previousUserBecameOffline && previousUserId && previousUserId !== userId) {
          await emitOfflineUpdate(io, previousUserId);
        }

        await setUserOnlineInDb(userId);

        if (becameOnline) {
          io.emit("presence:update", {
            userId,
            status: "online",
          });
        }
      } catch (error) {
        console.error("Failed to process userOnline event:", error);
      }
    });

    socket.on("disconnect", async () => {
      try {
        const { userId, becameOffline } = removeSocket(socket.id);

        if (becameOffline && userId) {
          await emitOfflineUpdate(io, userId);
        }
      } catch (error) {
        console.error("Failed to process disconnect presence cleanup:", error);
      }

      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = {
  registerSocketHandlers,
};
