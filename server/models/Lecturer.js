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
    // Track how many people rated this lecturer
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

// Virtual field to display rating with stars
lecturerSchema.virtual("ratingDisplay").get(function () {
  if (!this.averageRating) return "לא דורג";
  return `${this.averageRating.toFixed(1)} ⭐`;
});

// Ensure virtual fields are included when converting to JSON
lecturerSchema.set("toJSON", { virtuals: true });
lecturerSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Lecturer", lecturerSchema);