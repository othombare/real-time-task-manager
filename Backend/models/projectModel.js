const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
      },
    ],
    projectCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
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
  },
  { timestamps: true }
);

// Indexes
projectSchema.index({ projectCode: 1 }, { unique: true });
projectSchema.index({ "members.user": 1 });

// Pre-save middleware to ensure projectCode is uppercase
projectSchema.pre("save", function (next) {
  if (this.projectCode) {
    this.projectCode = this.projectCode.toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Project", projectSchema);
