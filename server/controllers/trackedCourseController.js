const TrackedCourse = require("../models/TrackedCourse");
const Course = require("../models/Course");

exports.getTrackedCourses = async (req, res) => {
  try {
    const trackedCourses = await TrackedCourse.find({ user: req.user._id })
      .populate({
        path: "course",
        populate: {
          path: "lecturers",
          select: "name email department",
        },
      })
      .exec();

    const validTrackedCourses = trackedCourses.filter(
      (tc) => tc.course !== null
    );

    const invalidTrackedCourses = trackedCourses.filter(
      (tc) => tc.course === null
    );
    if (invalidTrackedCourses.length > 0) {
      const idsToDelete = invalidTrackedCourses.map((tc) => tc._id);
      await TrackedCourse.deleteMany({ _id: { $in: idsToDelete } });
    }

    res.status(200).json(validTrackedCourses);
  } catch (err) {
    res
      .status(500)
      .json({ message: "שגיאה בטעינת הקורסים", error: err.message });
  }
};

exports.addTrackedCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if already tracked
    const exists = await TrackedCourse.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (exists) {
      return res.status(400).json({ message: "כבר עוקבים אחר קורס זה" });
    }

    const newTracked = new TrackedCourse({
      user: req.user._id,
      course: courseId,
    });

    await newTracked.save();

    res
      .status(201)
      .json({ message: "קורס נוסף למעקב בהצלחה", trackedCourse: newTracked });
  } catch (err) {
    res
      .status(500)
      .json({ message: "שגיאה בהוספת הקורס למעקב", error: err.message });
  }
};

exports.removeTrackedCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await TrackedCourse.findOneAndDelete({
      user: req.user._id,
      course: courseId,
    });

    if (!result) {
      return res.status(404).json({ message: "קורס לא נמצא במעקב" });
    }

    res.status(200).json({ message: "קורס הוסר מהמעקב בהצלחה" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "שגיאה בהסרת הקורס מהמעקב", error: err.message });
  }
};
