const express = require("express");
const router = express.Router();
const courseReviewController = require("../controllers/courseReviewController");
const { protect } = require("../middleware/authMiddleware");

// Get all reviews
router.get("/", protect, courseReviewController.getAllReviews);

// Get reviews for a specific course
router.get("/course/:courseId", protect, courseReviewController.getReviewsByCourse);

// Create new review
router.post("/", protect, courseReviewController.createReview);

module.exports = router;