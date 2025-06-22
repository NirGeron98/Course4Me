const express = require("express");
const router = express.Router();
const lecturerReviewController = require("../controllers/lecturerReviewController");
const { protect } = require("../middleware/authMiddleware");

// Get all lecturer reviews (admin only)
router.get("/", protect, lecturerReviewController.getAllLecturerReviews);

// Get reviews for a specific lecturer (with optional course filter)
router.get("/lecturer/:lecturerId", protect, lecturerReviewController.getReviewsByLecturer);

// Create new lecturer review
router.post("/", protect, lecturerReviewController.createLecturerReview);

// Update lecturer review
router.put("/:reviewId", protect, lecturerReviewController.updateLecturerReview);

// Delete lecturer review
router.delete("/:reviewId", protect, lecturerReviewController.deleteLecturerReview);

module.exports = router;