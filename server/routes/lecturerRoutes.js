const express = require("express");
const router = express.Router();
const lecturerController = require("../controllers/lecturerController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Public routes
router.get("/", lecturerController.getAllLecturers);
router.get("/:id", lecturerController.getLecturerById);
router.get("/search/:query", lecturerController.searchLecturers);

// Protected routes (admin only)
router.post("/", protect, admin, lecturerController.createLecturer);
router.put("/:id", protect, admin, lecturerController.updateLecturer);
router.delete("/:id", protect, admin, lecturerController.deleteLecturer);

module.exports = router;