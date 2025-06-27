const TrackedLecturer = require("../models/TrackedLecturer");

exports.getTrackedLecturers = async (req, res) => {
  try {
    const tracked = await TrackedLecturer.find({ user: req.user._id }).populate("lecturer");
    res.status(200).json(tracked);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בטעינת מרצים במעקב", error: err.message });
  }
};

exports.addTrackedLecturer = async (req, res) => {
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
};

exports.removeTrackedLecturer = async (req, res) => {
  try {
    await TrackedLecturer.findOneAndDelete({
      user: req.user._id,
      lecturer: req.params.lecturerId,
    });
    res.status(200).json({ message: "המרצה הוסר מהמעקב" });
  } catch (err) {
    res.status(500).json({ message: "שגיאה בהסרת מעקב", error: err.message });
  }
};
