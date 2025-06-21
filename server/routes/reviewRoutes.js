const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Create a new review (protected)
router.post("/", protect, reviewController.createReview);

// Get all reviews for a course
router.get("/course/:courseId", reviewController.getReviewsByCourse);

module.exports = router;
