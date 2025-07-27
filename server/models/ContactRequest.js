const mongoose = require("mongoose");

const contactRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      enum: [
        "add_lecturer_to_course",
        "add_course_to_lecturer",
        "add_course_to_system",
        "add_lecturer_to_system",
        "general_inquiry"
      ]
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "answered"],
      default: "pending",
    },
    adminResponse: {
      type: String,
      maxlength: 1000,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
contactRequestSchema.index({ user: 1, createdAt: -1 });
contactRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("ContactRequest", contactRequestSchema);