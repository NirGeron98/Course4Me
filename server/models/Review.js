const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interest: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    workload: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    investment: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    teachingQuality: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
