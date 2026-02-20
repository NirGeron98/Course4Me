const Course = require("../models/Course");
const Lecturer = require("../models/Lecturer");
const CourseReview = require("../models/CourseReview");
const { get: cacheGet, set: cacheSet, clearByPrefix: cacheClearCourses } = require("../utils/listCache");
const CACHE_KEY_PREFIX = "courses:";

// Performance: single aggregation instead of N+1 queries for course ratings.
// Returns Map<courseIdStr, { averageRating, ratingsCount }>
const getCourseRatingsMap = async (courseIds) => {
  if (!courseIds || courseIds.length === 0) return new Map();
  const stats = await CourseReview.aggregate([
    { $match: { course: { $in: courseIds } } },
    { $group: {
      _id: "$course",
      avgRec: { $avg: "$recommendation" },
      count: { $sum: 1 },
    } },
  ]);
  const map = new Map();
  for (const s of stats) {
    map.set(String(s._id), {
      averageRating: s.avgRec != null ? parseFloat(s.avgRec.toFixed(2)) : null,
      ratingsCount: s.count || 0,
    });
  }
  return map;
};

// Get all courses (with optional limit; in-memory cache 2min, invalidated on write)
exports.getAllCourses = async (req, res) => {
  try {
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit, 10) || 0, 2000) : 0;
    const cacheKey = `${CACHE_KEY_PREFIX}list:${limit}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
    const query = Course.find().populate("lecturers", "name email department").sort({ createdAt: -1 });
    const courses = limit > 0 ? await query.limit(limit).lean() : await query.lean();
    const courseIds = courses.map((c) => c._id);
    const ratingsMap = await getCourseRatingsMap(courseIds);
    const coursesWithUpdatedRatings = courses.map((course) => {
      const stats = ratingsMap.get(String(course._id)) || { averageRating: null, ratingsCount: 0 };
      return { ...course, averageRating: stats.averageRating, ratingsCount: stats.ratingsCount };
    });
    cacheSet(cacheKey, coursesWithUpdatedRatings);
    res.status(200).json(coursesWithUpdatedRatings);
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

    cacheClearCourses(CACHE_KEY_PREFIX);
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
    cacheClearCourses(CACHE_KEY_PREFIX);
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
    cacheClearCourses(CACHE_KEY_PREFIX);
    res.status(200).json({ message: "קורס נמחק בהצלחה" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};

// Search courses (uses single aggregation for ratings instead of N+1)
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
      .sort({ createdAt: -1 })
      .lean();

    if (lecturer) {
      const lecturerLower = lecturer.toLowerCase();
      courses = courses.filter(
        (course) =>
          course.lecturers &&
          course.lecturers.some((l) => l && l.name && l.name.toLowerCase().includes(lecturerLower))
      );
    }

    const courseIds = courses.map((c) => c._id);
    const ratingsMap = await getCourseRatingsMap(courseIds);
    const coursesWithUpdatedRatings = courses.map((course) => {
      const stats = ratingsMap.get(String(course._id)) || { averageRating: null, ratingsCount: 0 };
      return { ...course, averageRating: stats.averageRating, ratingsCount: stats.ratingsCount };
    });
    res.status(200).json(coursesWithUpdatedRatings);
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

// GET /api/courses/by-lecturer/:lecturerId (single aggregation for ratings)
exports.getCoursesByLecturer = async (req, res) => {
  try {
    const courses = await Course.find({ lecturers: req.params.lecturerId })
      .populate("lecturers", "name email department")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 })
      .lean();
    const courseIds = courses.map((c) => c._id);
    const ratingsMap = await getCourseRatingsMap(courseIds);
    const coursesWithUpdatedRatings = courses.map((course) => {
      const stats = ratingsMap.get(String(course._id)) || { averageRating: null, ratingsCount: 0 };
      return { ...course, averageRating: stats.averageRating, ratingsCount: stats.ratingsCount };
    });
    res.status(200).json(coursesWithUpdatedRatings);
  } catch (err) {
    console.error("Error fetching courses by lecturer:", err);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};