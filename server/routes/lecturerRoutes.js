const express = require("express");
const router = express.Router();
const lecturerController = require("../controllers/lecturerController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const { addCacheHeaders } = require("../middleware/cacheMiddleware");

// Public routes (short HTTP cache for list)
router.get("/", addCacheHeaders(60), lecturerController.getAllLecturers);
router.get("/by-slug/:slug", lecturerController.getLecturerBySlug);
router.get("/:id", lecturerController.getLecturerById);
router.get("/:id/full", lecturerController.getLecturerWithCourses);
router.get("/search/:query", lecturerController.searchLecturers);

// Get lecturers by department
router.get("/department/:departmentId", lecturerController.getLecturersByDepartment);

// Protected routes (admin only)
router.post("/", protect, admin, lecturerController.createLecturer);
router.put("/:id", protect, admin, lecturerController.updateLecturer);
router.delete("/:id", protect, admin, lecturerController.deleteLecturer);

module.exports = router;