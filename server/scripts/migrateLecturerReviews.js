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
      console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
      return;
    }

    console.log('Connecting to MongoDB...');
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Find all lecturer reviews that don't have the courses array
    const reviewsToMigrate = await LecturerReview.find({
      $or: [
        { courses: { $exists: false } },
        { courses: { $size: 0 } }
      ],
      course: { $exists: true }
    });

    console.log(`Found ${reviewsToMigrate.length} reviews to migrate`);

    for (const review of reviewsToMigrate) {
      if (review.course && (!review.courses || review.courses.length === 0)) {
        review.courses = [review.course];
        await review.save();
        console.log(`Migrated review ${review._id}: added course ${review.course} to courses array`);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateLecturerReviews();
}

module.exports = migrateLecturerReviews;
