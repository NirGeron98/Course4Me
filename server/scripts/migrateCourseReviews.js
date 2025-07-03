const mongoose = require('mongoose');
const CourseReview = require('../models/CourseReview');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const migrateCourseReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const reviews = await CourseReview.find({
      $or: [
        { lecturers: { $exists: false } },
        { lecturers: { $size: 0 } }
      ],
      lecturer: { $exists: true, $ne: null }
    });

    let migratedCount = 0;
    for (const review of reviews) {
      try {
        // Create lecturers array from single lecturer
        const lecturers = [review.lecturer];
        
        await CourseReview.findByIdAndUpdate(review._id, {
          lecturers: lecturers
        });
        
        migratedCount++;
      } catch (error) {
        console.error(`Error migrating course review ${review._id}:`, error);
      }
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateCourseReviews();
}

module.exports = migrateCourseReviews;
