const mongoose = require("mongoose");

const lecturerReviewSchema = new mongoose.Schema(
  {
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      required: true,
    },
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
    clarity: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    responsiveness: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    availability: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    organization: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    knowledge: {
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

// Compound index to ensure one review per user per lecturer per course
lecturerReviewSchema.index({ lecturer: 1, course: 1, user: 1 }, { unique: true });

// Virtual field for overall rating (average of all criteria)
lecturerReviewSchema.virtual("overallRating").get(function () {
  return (
    (this.clarity + this.responsiveness + this.availability + this.organization + this.knowledge) / 5
  ).toFixed(1);
});

// Ensure virtual fields are included when converting to JSON
lecturerReviewSchema.set("toJSON", { virtuals: true });
lecturerReviewSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("LecturerReview", lecturerReviewSchema);