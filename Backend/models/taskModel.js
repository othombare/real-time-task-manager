const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    project: {
      type: mongoose.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      index: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },
    dueDate: Date,
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedBy: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Compound index
taskSchema.index({ project: 1, assignedTo: 1 });

// Pre-save middleware to auto-adjust priority based on dueDate
taskSchema.pre("save", function (next) {
  if (this.dueDate) {
    const now = new Date();
    const timeDifference = this.dueDate - now;
    const daysLeft = timeDifference / (1000 * 60 * 60 * 24);

    if (daysLeft <= 1) {
      this.priority = "high";
    } else if (daysLeft <= 3) {
      this.priority = "medium";
    } else {
      this.priority = "low";
    }
  }
  next();
});

module.exports = mongoose.model("Task", taskSchema);
