const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    todo: {
      type: String,
      required: [true, "Todo text is required."],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

todoSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Todo", todoSchema);
