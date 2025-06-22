const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const TrackedLecturer = require("../models/TrackedLecturer");

// GET - Get all tracked lecturers for current user
router.get("/", protect, async (req, res) => {
  try {
    const tracked = await TrackedLecturer.find({ user: req.user._id }).populate("lecturer");
    res.status(200).json(tracked);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בטעינת מרצים במעקב", error: err.message });
  }
});

// POST - Add lecturer to tracked list
router.post("/", protect, async (req, res) => {
  const { lecturerId } = req.body;
  try {
    const exists = await TrackedLecturer.findOne({ user: req.user._id, lecturer: lecturerId });
    if (exists) {
      return res.status(400).json({ message: "כבר עוקבים אחר מרצה זה" });
    }

    const newTrack = await TrackedLecturer.create({
      user: req.user._id,
      lecturer: lecturerId,
    });

    const populated = await newTrack.populate("lecturer");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בהוספת מעקב", error: err.message });
  }
});

// DELETE - Remove tracked lecturer
router.delete("/:lecturerId", protect, async (req, res) => {
  try {
    await TrackedLecturer.findOneAndDelete({
      user: req.user._id,
      lecturer: req.params.lecturerId,
    });
    res.status(200).json({ message: "המרצה הוסר מהמעקב" });
  } catch (err) {
    res.status(500).json({ message: "שגיאה בהסרת מעקב", error: err.message });
  }
});

module.exports = router;
