const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    lecturers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecturer",
      },
    ],
    academicInstitution: {
      type: String,
      required: true,
      default: "מכללת אפקה",
    },
    credits: {
      type: Number,
      required: true,
      min: 0,
      max: 20,
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: "Credits must be a positive number",
      },
    },
    department: {
      type: String,
    },
    prerequisites: {
      type: String,
    },
    averageRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null, // No rating initially
      validate: {
        validator: function (value) {
          // Allow null/undefined (no rating yet) or valid rating between 1-5
          return (
            value === null || value === undefined || (value >= 1 && value <= 5)
          );
        },
        message: "Average rating must be between 1 and 5",
      },
    },
    // Optional: Track how many people rated this course
    ratingsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Virtual field to display credits in Hebrew format
courseSchema.virtual("creditsDisplay").get(function () {
  return `${this.credits.toFixed(1)} נק"ז`; 
});

// Virtual field to display rating with stars
courseSchema.virtual("ratingDisplay").get(function () {
  if (!this.averageRating) return "לא דורג";
  return `${this.averageRating.toFixed(1)} ⭐`;
});

// Virtual field to display lecturer name (when populated)
courseSchema.virtual("lecturerName").get(function () {
  if (Array.isArray(this.lecturers) && this.lecturers.length > 0) {
    return this.lecturers[0]?.name || null;
  }
  return null;
});

// Ensure virtual fields are included when converting to JSON
courseSchema.set("toJSON", { virtuals: true });
courseSchema.set("toObject", { virtuals: true });

module.exports =
  mongoose.models.Course || mongoose.model("Course", courseSchema);
