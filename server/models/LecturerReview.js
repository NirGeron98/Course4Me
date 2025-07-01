const mongoose = require("mongoose");

const lecturerReviewSchema = new mongoose.Schema(
  {
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      required: true,
    },
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: false, // Make it optional for backward compatibility
    }],
    // Keep the old course field for backward compatibility
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: false, // Keep as optional since we now have courses array
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
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound indexes for both old and new formats
// Old format: one review per user per lecturer per course
lecturerReviewSchema.index({ lecturer: 1, course: 1, user: 1 }, { unique: true, sparse: true });
// New format: one review per user per lecturer (with multiple courses)
lecturerReviewSchema.index({ lecturer: 1, user: 1, courses: 1 }, { unique: false });

// Pre-save middleware to ensure backward compatibility
lecturerReviewSchema.pre('save', function(next) {
  // If courses array is empty but course exists, populate courses array
  if ((!this.courses || this.courses.length === 0) && this.course) {
    this.courses = [this.course];
  }
  // If courses array exists but course is empty, set course to first item
  if (this.courses && this.courses.length > 0 && !this.course) {
    this.course = this.courses[0];
  }
  
  // Ensure at least one course is specified
  if ((!this.courses || this.courses.length === 0) && !this.course) {
    const error = new Error('יש לציין לפחות קורס אחד');
    return next(error);
  }
  
  next();
});

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