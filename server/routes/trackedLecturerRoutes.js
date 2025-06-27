const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const trackedLecturerController = require("../controllers/trackedLecturerController");

router.get("/", protect, trackedLecturerController.getTrackedLecturers);
router.post("/", protect, trackedLecturerController.addTrackedLecturer);
router.delete("/:lecturerId", protect, trackedLecturerController.removeTrackedLecturer);

module.exports = router;
