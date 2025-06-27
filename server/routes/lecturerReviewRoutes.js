const express = require("express");
const router = express.Router();
const lecturerReviewController = require("../controllers/lecturerReviewController");
const { protect } = require("../middleware/authMiddleware");

router.get("/test", (req, res) => {
  res.json({
    message: "Test route works",
    timestamp: new Date(),
    status: "OK",
  });
});

router.get("/test/:lecturerId", (req, res) => {
  res.json({
    message: "Test lecturer route works",
    lecturerId: req.params.lecturerId,
    timestamp: new Date(),
    status: "OK",
  });
});

// Public route - get reviews for a specific lecturer (no auth needed for viewing)
router.get(
  "/lecturer/:lecturerId",
  lecturerReviewController.getReviewsByLecturer
);

// Protected routes (require authentication)
router.use(protect); // Apply protection to all routes below

// Get all lecturer reviews (admin only - you might want to add admin middleware)
router.get("/", lecturerReviewController.getAllLecturerReviews);

// Create new lecturer review
router.post("/", lecturerReviewController.createLecturerReview);

// Update lecturer review
router.put("/:reviewId", lecturerReviewController.updateLecturerReview);

// Delete lecturer review
router.delete("/:reviewId", lecturerReviewController.deleteLecturerReview);

router.get("/test-connection", (req, res) => {
  res.json({
    message: "Connection works",
    timestamp: new Date(),
    status: "OK",
  });
});

router.get("/test-lecturer/:lecturerId", (req, res) => {
  res.json({
    message: "Test lecturer route works",
    lecturerId: req.params.lecturerId,
    timestamp: new Date(),
    status: "OK",
  });
});

module.exports = router;
