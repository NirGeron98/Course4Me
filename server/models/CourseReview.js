const mongoose = require("mongoose");

const courseReviewSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lecturers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
    }],
    // Keep the old lecturer field for backward compatibility
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
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
    // CHANGE: Use 'workload' instead of 'workload' to match your existing schema
    workload: {
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

// Compound index to ensure one review per user per course per lecturer combination
courseReviewSchema.index({ course: 1, user: 1 });
// Performance: aggregation and "reviews by course" queries
courseReviewSchema.index({ course: 1 });

// Pre-save middleware to handle backward compatibility
courseReviewSchema.pre('save', function(next) {
  // If lecturers array is empty but lecturer field exists, migrate to lecturers array
  if (this.lecturer && (!this.lecturers || this.lecturers.length === 0)) {
    this.lecturers = [this.lecturer];
  }
  // If lecturers array exists but lecturer field is empty, set lecturer to first in array
  else if (this.lecturers && this.lecturers.length > 0 && !this.lecturer) {
    this.lecturer = this.lecturers[0];
  }
  next();
});

// Virtual field for detailed average rating (average of criteria except recommendation)
courseReviewSchema.virtual("detailedAverageRating").get(function () {
  return (
    (this.interest + this.difficulty + this.workload + this.teachingQuality) / 4
  ).toFixed(1);
});

// Virtual field for overall average (including all criteria)
courseReviewSchema.virtual("overallAverageRating").get(function () {
  return (
    (this.interest + this.difficulty + this.workload + this.teachingQuality + this.recommendation) / 5
  ).toFixed(1);
});

// Ensure virtual fields are included when converting to JSON
courseReviewSchema.set("toJSON", { virtuals: true });
courseReviewSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("CourseReview", courseReviewSchema);