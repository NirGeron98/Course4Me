const Course = require("../models/Course");
const Lecturer = require("../models/Lecturer");

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate(
      "lecturers",
      "name email department"
    );

    res.status(200).json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: "lecturers",
        select: "-__v -createdAt -updatedAt -ratingsCount",
      })
      .populate("createdBy", "fullName email");

    if (!course) {
      return res.status(404).json({ message: "קורס לא נמצא" });
    }

    res.status(200).json(course);
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};

// Get course by courseNumber
exports.getCourseByNumber = async (req, res) => {
  try {
    const course = await Course.findOne({ courseNumber: req.params.courseNumber })
      .populate({
        path: "lecturers",
        select: "-__v -createdAt -updatedAt -ratingsCount",
      })
      .populate("createdBy", "fullName email");

    if (!course) {
      return res.status(404).json({ message: "קורס לא נמצא" });
    }

    res.status(200).json(course);
  } catch (err) {
    console.error("Error fetching course by number:", err);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};

// Create new course
exports.createCourse = async (req, res) => {
  try {
    const {
      courseNumber,
      title,
      description,
      lecturers,
      academicInstitution,
      credits,
      department,
      prerequisites,
    } = req.body;

    const existingCourse = await Course.findOne({ courseNumber });
    if (existingCourse) {
      return res.status(400).json({ message: "מספר קורס כבר קיים במערכת" });
    }

    const lecturerObjectIds = [];
    if (lecturers && Array.isArray(lecturers)) {
      for (const lec of lecturers) {
        let lecDoc = null;

        if (typeof lec === "string" && lec.trim().length === 24) {
          lecDoc = await Lecturer.findById(lec.trim());
        } else {
          lecDoc = await Lecturer.findOne({ name: lec.trim() });
        }

        if (lecDoc) {
          lecturerObjectIds.push(lecDoc._id);
        } else {
          return res.status(400).json({ message: `מרצה לא נמצא: ${lec}` });
        }
      }
    }

    const newCourse = await Course.create({
      courseNumber,
      title,
      description,
      lecturers: lecturerObjectIds,
      academicInstitution,
      credits: parseFloat(credits),
      department,
      prerequisites,
      createdBy: req.user._id,
    });

    res.status(201).json(newCourse);
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const updates = {};
    const {
      courseNumber,
      title,
      description,
      lecturers,
      academicInstitution,
      credits,
      department,
      prerequisites,
    } = req.body;

    if (courseNumber) {
      const existingCourse = await Course.findOne({
        courseNumber,
        _id: { $ne: req.params.id },
      });
      if (existingCourse) {
        return res.status(400).json({ message: "מספר קורס כבר קיים במערכת" });
      }
      updates.courseNumber = courseNumber;
    }

    if (title) updates.title = title;
    if (description) updates.description = description;
    if (academicInstitution) updates.academicInstitution = academicInstitution;
    if (credits !== undefined) updates.credits = parseFloat(credits);
    if (department) updates.department = department;
    if (prerequisites) updates.prerequisites = prerequisites;

    if (lecturers && Array.isArray(lecturers)) {
      const lecturerObjectIds = [];

      for (const lec of lecturers) {
        let lecDoc = null;

        if (typeof lec === "string" && lec.trim().length === 24) {
          lecDoc = await Lecturer.findById(lec.trim());
        } else {
          lecDoc = await Lecturer.findOne({ name: lec.trim() });
        }

        if (!lecDoc) {
          return res.status(400).json({ message: `מרצה לא נמצא: ${lec}` });
        }

        lecturerObjectIds.push(lecDoc._id);
      }

      updates.lecturers = lecturerObjectIds;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate("lecturers", "name email department")
      .populate("createdBy", "fullName email");

    if (!updatedCourse) {
      return res.status(404).json({ message: "קורס לא נמצא" });
    }

    res.status(200).json(updatedCourse);
  } catch (err) {
    console.error("Error updating course:", err);
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: errors.join(", ") });
    }
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({ message: "קורס לא נמצא" });
    }

    res.status(200).json({ message: "קורס נמחק בהצלחה" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};

// Search courses
exports.searchCourses = async (req, res) => {
  try {
    const { query, department, lecturer, credits } = req.query;
    let searchCriteria = {};

    if (query) {
      searchCriteria.$or = [
        { title: { $regex: query, $options: "i" } },
        { courseNumber: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    if (department) {
      searchCriteria.department = { $regex: department, $options: "i" };
    }

    if (credits) {
      searchCriteria.credits = parseFloat(credits);
    }

    let courses = await Course.find(searchCriteria)
      .populate("lecturers", "name email department")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    // Filter by lecturer name if provided (since it's now populated)
    if (lecturer) {
      courses = courses.filter(
        (course) =>
          course.lecturer &&
          course.lecturer.name.toLowerCase().includes(lecturer.toLowerCase())
      );
    }

    res.status(200).json(courses);
  } catch (err) {
    console.error("Error searching courses:", err);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};

// GET /api/courses/:id/full
exports.getCourseWithLecturers = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: "lecturers",
        select: "-__v -createdAt -updatedAt",
      })
      .populate("createdBy", "fullName email");

    if (!course) {
      return res.status(404).json({ message: "קורס לא נמצא" });
    }

    res.status(200).json(course);
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};

// GET /api/courses/by-lecturer/:lecturerId
exports.getCoursesByLecturer = async (req, res) => {
  try {
    const courses = await Course.find({ lecturers: req.params.lecturerId })
      .populate("lecturers", "name email department")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json(courses);
  } catch (err) {
    console.error("Error fetching courses by lecturer:", err);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};