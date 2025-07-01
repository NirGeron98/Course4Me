const mongoose = require('mongoose');
const LecturerReview = require('../models/LecturerReview');
const path = require('path');

// Load environment variables from the parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function migrateLecturerReviews() {
  try {
    console.log('Starting lecturer reviews migration...');
    
    // Check if MONGO_URI exists
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI not found in environment variables');
      return;
    }

    console.log('Connecting to MongoDB...');
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully');

    // Find all lecturer reviews that don't have the courses array
    console.log('Finding reviews to migrate...');
    const reviewsToMigrate = await LecturerReview.find({
      $or: [
        { courses: { $exists: false } },
        { courses: { $size: 0 } }
      ],
      course: { $exists: true }
    });

    console.log(`Found ${reviewsToMigrate.length} reviews to migrate`);

    let migratedCount = 0;
    for (const review of reviewsToMigrate) {
      if (review.course && (!review.courses || review.courses.length === 0)) {
        review.courses = [review.course];
        await review.save();
        migratedCount++;
        console.log(`Migrated review ${review._id}: ${migratedCount}/${reviewsToMigrate.length}`);
      }
    }

    console.log(`Migration completed! Migrated ${migratedCount} reviews.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    console.log('Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('Migration finished');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateLecturerReviews();
}

module.exports = migrateLecturerReviews;
