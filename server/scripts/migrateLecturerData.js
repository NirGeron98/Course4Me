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
    console.log("📝 Adding rating fields to lecturers...");
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
    console.log("✅ Lecturer rating fields added");

    // 2. Check if CourseReview has lecturer field
    console.log("📝 Checking CourseReview structure...");
    const sampleReview = await CourseReview.findOne();
    
    if (sampleReview && !sampleReview.lecturer) {
      console.log("⚠️  CourseReview missing lecturer field - needs manual migration");
      console.log("💡 Suggestion: You may need to manually add lecturer field to existing reviews");
      console.log("   This requires choosing a default lecturer for each course or deleting existing reviews");
    } else if (sampleReview && sampleReview.lecturer) {
      console.log("✅ CourseReview already has lecturer field");
    } else {
      console.log("ℹ️  No existing reviews found - structure is ready for new reviews");
    }

    // 3. Display summary
    const lecturerCount = await Lecturer.countDocuments();
    const courseCount = await Course.countDocuments();
    const reviewCount = await CourseReview.countDocuments();

    console.log("\n📊 Migration Summary:");
    console.log(`   Lecturers: ${lecturerCount}`);
    console.log(`   Courses: ${courseCount}`);
    console.log(`   Course Reviews: ${reviewCount}`);
    console.log(`   Lecturer Reviews: 0 (new collection)`);

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n📝 Next Steps:");
    console.log("   1. Start your server with the new LecturerReview model");
    console.log("   2. Test creating lecturer reviews");
    console.log("   3. If you have existing course reviews, they may need lecturer assignment");

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Function to clean existing reviews (optional - use with caution)
const cleanExistingReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    console.log("⚠️  DANGER: This will delete all existing course reviews!");
    console.log("🔄 Starting cleanup in 5 seconds... Press Ctrl+C to cancel");
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    const deleteResult = await CourseReview.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} course reviews`);

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
    console.log("🔄 Reset course ratings");

    console.log("✅ Cleanup completed");

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