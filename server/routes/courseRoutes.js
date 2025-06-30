const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Public routes
router.get("/", courseController.getAllCourses);
router.get("/search/:query", courseController.searchCourses);
router.get("/by-number/:courseNumber", courseController.getCourseByNumber);
router.get("/:id/full", courseController.getCourseWithLecturers);
router.get("/by-lecturer/:lecturerId", courseController.getCoursesByLecturer);
router.get("/:id", courseController.getCourseById);

// Protected routes (admin only for create, update, delete)
router.post("/", protect, admin, courseController.createCourse);
router.put("/:id", protect, admin, courseController.updateCourse);
router.delete("/:id", protect, admin, courseController.deleteCourse);

module.exports = router;