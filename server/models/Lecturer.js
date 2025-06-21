const mongoose = require("mongoose");

const lecturerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    department: {
      type: String,
      required: true,
    },
    academicInstitution: {
      type: String,
      default: "מכללת אפקה",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lecturer", lecturerSchema);