const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const trackedCourseController = require("../controllers/trackedCourseController");

router.get("/", protect, trackedCourseController.getTrackedCourses);
router.post("/", protect, trackedCourseController.addTrackedCourse);
router.delete("/:courseId", protect, trackedCourseController.removeTrackedCourse);

module.exports = router;