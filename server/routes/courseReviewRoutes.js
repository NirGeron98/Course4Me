const express = require("express");
const router = express.Router();
const courseReviewController = require("../controllers/courseReviewController");
const { protect } = require("../middleware/authMiddleware");

// DEBUG ROUTE - Add this temporarily for testing
router.post("/test", protect, async (req, res) => {

  try {
    // Test database connection
    const CourseReview = require("../models/CourseReview");
    const Course = require("../models/Course");
    const Lecturer = require("../models/Lecturer");
    
    // Check if the course exists
    if (req.body.course) {
      const course = await Course.findById(req.body.course);
    }
    
    // Check if the lecturer exists
    if (req.body.lecturer) {
      const lecturer = await Lecturer.findById(req.body.lecturer);
    }
    
    // Check if models are working
    const reviewCount = await CourseReview.countDocuments();
    
    // Test creating a CourseReview instance without saving
    if (req.body.course && req.body.lecturer && req.user) {
      const testReview = new CourseReview({
        course: req.body.course,
        lecturer: req.body.lecturer,
        user: req.user._id,
        interest: Number(req.body.interest) || 3,
        difficulty: Number(req.body.difficulty) || 3,
        workload: Number(req.body.workload) || 3,
        teachingQuality: Number(req.body.teachingQuality) || 3,
        recommendation: Number(req.body.recommendation) || 3,
        comment: req.body.comment || '',
        isAnonymous: Boolean(req.body.isAnonymous)
      });
      
    }
    
    res.json({
      success: true,
      message: 'Test route working',
      data: {
        userExists: !!req.user,
        userId: req.user?._id,
        userName: req.user?.fullName,
        courseId: req.body.course,
        lecturerId: req.body.lecturer,
        reviewCount,
        requestBody: req.body
      }
    });
    
  } catch (error) {
    console.error('=== TEST ROUTE ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all reviews (admin only)
router.get("/", protect, courseReviewController.getAllReviews);

// Get reviews for a specific course (with optional lecturer filter)
router.get("/course/:courseId", protect, courseReviewController.getReviewsByCourse);

// Create new review
router.post("/", protect, courseReviewController.createReview);

// Update review
router.put("/:reviewId", protect, courseReviewController.updateReview);

// Delete review
router.delete("/:reviewId", protect, courseReviewController.deleteReview);

router.get("/stats/:courseId", courseReviewController.getCourseReviewStats);

module.exports = router;