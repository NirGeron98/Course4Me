const mongoose = require("mongoose");
const Course = require("../models/Course");
const Lecturer = require("../models/Lecturer");
const CourseReview = require("../models/CourseReview");
require("dotenv").config();

const migrateLecturerData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);


    // 1. Add averageRating and ratingsCount fields to existing lecturers
    await Lecturer.updateMany(
      {}, 
      { 
        $set: { 
          averageRating: null, 
          ratingsCount: 0 
        } 
      },
      { upsert: false }
    );

    // 2. Check if CourseReview has lecturer field
    const sampleReview = await CourseReview.findOne();
  
    // 3. Display summary
    const lecturerCount = await Lecturer.countDocuments();
    const courseCount = await Course.countDocuments();
    const reviewCount = await CourseReview.countDocuments();

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.connection.close();
  }
};

// Function to clean existing reviews (optional - use with caution)
const cleanExistingReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await new Promise(resolve => setTimeout(resolve, 5000));

    const deleteResult = await CourseReview.deleteMany({});

    // Reset course ratings
    await Course.updateMany(
      {}, 
      { 
        $set: { 
          averageRating: null, 
          ratingsCount: 0 
        } 
      }
    );


  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the appropriate function based on command line argument
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'clean') {
    cleanExistingReviews();
  } else {
    migrateLecturerData();
  }
}

module.exports = { migrateLecturerData, cleanExistingReviews };