const mongoose = require('mongoose');
const LecturerReview = require('../models/LecturerReview');
const path = require('path');

// Load environment variables from the parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function migrateLecturerReviews() {
  try {
    
    // Check if MONGO_URI exists
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI not found in environment variables');
      return;
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    // Find all lecturer reviews that don't have the courses array
    const reviewsToMigrate = await LecturerReview.find({
      $or: [
        { courses: { $exists: false } },
        { courses: { $size: 0 } }
      ],
      course: { $exists: true }
    });

    let migratedCount = 0;
    for (const review of reviewsToMigrate) {
      if (review.course && (!review.courses || review.courses.length === 0)) {
        review.courses = [review.course];
        await review.save();
        migratedCount++;
      }
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateLecturerReviews();
}

module.exports = migrateLecturerReviews;
