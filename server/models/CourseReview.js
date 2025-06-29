const mongoose = require("mongoose");

const courseReviewSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
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
    recommendation: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index to ensure one review per user per course per lecturer
courseReviewSchema.index({ course: 1, lecturer: 1, user: 1 }, { unique: true });

// Virtual field for detailed average rating (average of criteria except recommendation)
courseReviewSchema.virtual("detailedAverageRating").get(function () {
  return (
    (this.interest + this.difficulty + this.investment + this.teachingQuality) / 4
  ).toFixed(1);
});

// Virtual field for overall average (including all criteria)
courseReviewSchema.virtual("overallAverageRating").get(function () {
  return (
    (this.interest + this.difficulty + this.investment + this.teachingQuality + this.recommendation) / 5
  ).toFixed(1);
});

// Ensure virtual fields are included when converting to JSON
courseReviewSchema.set("toJSON", { virtuals: true });
courseReviewSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("CourseReview", courseReviewSchema);