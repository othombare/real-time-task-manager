const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const { getOnlineUserIds, isUserOnline } = require("../socket/presenceTracker");

exports.getPresence = catchAsync(async (req, res) => {
  const users = await User.find().select(
    "name email photo lastSeen isOnline role location githubProfile linkedinProfile"
  );
  const onlineUserIds = new Set(getOnlineUserIds());
  const presenceByUserId = new Map();

  users.forEach((user) => {
    const userId = user._id.toString();
    const isOnlineNow = onlineUserIds.has(userId);

    presenceByUserId.set(userId, {
      userId,
      status: isOnlineNow ? "online" : "offline",
      lastSeen: isOnlineNow ? null : user.lastSeen || null,
      user: {
        _id: userId,
        name: user.name,
        email: user.email,
        photo: user.photo || "",
        role: user.role || "",
        location: user.location || "",
        githubProfile: user.githubProfile || "",
        linkedinProfile: user.linkedinProfile || "",
      },
    });
  });

  // In case a socket exists for a user that is not part of the queried set.
  onlineUserIds.forEach((userId) => {
    if (!presenceByUserId.has(userId) && isUserOnline(userId)) {
      presenceByUserId.set(userId, {
        userId,
        status: "online",
        lastSeen: null,
        user: null,
      });
    }
  });

  const presence = Array.from(presenceByUserId.values());

  res.status(200).json({
    status: "success",
    results: presence.length,
    data: {
      presence,
    },
  });
});
