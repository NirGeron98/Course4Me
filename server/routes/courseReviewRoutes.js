const express = require("express");
const router = express.Router();
const courseReviewController = require("../controllers/courseReviewController");
const { protect } = require("../middleware/authMiddleware");

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

module.exports = router;