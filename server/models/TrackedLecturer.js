const mongoose = require("mongoose");

const trackedLecturerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrackedLecturer", trackedLecturerSchema);
