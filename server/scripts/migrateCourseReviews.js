const mongoose = require('mongoose');
const CourseReview = require('../models/CourseReview');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const migrateCourseReviews = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('Finding course reviews to migrate...');
    const reviews = await CourseReview.find({
      $or: [
        { lecturers: { $exists: false } },
        { lecturers: { $size: 0 } }
      ],
      lecturer: { $exists: true, $ne: null }
    });

    console.log(`Found ${reviews.length} course reviews to migrate`);

    let migratedCount = 0;
    for (const review of reviews) {
      try {
        // Create lecturers array from single lecturer
        const lecturers = [review.lecturer];
        
        await CourseReview.findByIdAndUpdate(review._id, {
          lecturers: lecturers
        });
        
        migratedCount++;
        console.log(`Migrated course review ${review._id}: ${migratedCount}/${reviews.length}`);
      } catch (error) {
        console.error(`Error migrating course review ${review._id}:`, error);
      }
    }

    console.log(`Migration completed! Migrated ${migratedCount} course reviews.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateCourseReviews();
}

module.exports = migrateCourseReviews;
