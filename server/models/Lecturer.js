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
      required: false,
      unique: false,
      lowercase: true,
    },
    departments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    }],
    // Keep the old department field for backward compatibility
    department: {
      type: String,
      required: false, // Make it optional since we're moving to departments array
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

lecturerSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "lecturers",
});

// Virtual field to display rating with stars
lecturerSchema.virtual("ratingDisplay").get(function () {
  if (!this.averageRating) return "לא דורג";
  return `${this.averageRating.toFixed(1)} ⭐`;
});

// Virtual field to get department names (for backward compatibility)
lecturerSchema.virtual("departmentNames").get(function () {
  if (this.populated('departments') && this.departments.length > 0) {
    return this.departments.map(dept => dept.name).join(', ');
  }
  return this.department || '';
});

// Pre-save middleware to ensure at least one department is selected
lecturerSchema.pre('save', function(next) {
  // If departments array is empty but department string exists, that's ok for backward compatibility
  // If departments array has items, that's the new way
  // If both are empty, require at least the department string
  if ((!this.departments || this.departments.length === 0) && (!this.department || this.department.trim() === '')) {
    const error = new Error('יש לבחור לפחות מחלקה אחת');
    return next(error);
  }
  next();
});

// Index for better performance
lecturerSchema.index({ departments: 1 });
lecturerSchema.index({ email: 1 });
lecturerSchema.index({ department: 1 });
lecturerSchema.index({ name: 1 }); // Slug-by-name fallback and search
lecturerSchema.index({ createdAt: -1 }); // List sort

// Ensure virtual fields are included when converting to JSON
lecturerSchema.set("toJSON", { virtuals: true });
lecturerSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Lecturer", lecturerSchema);