const Lecturer = require("../models/Lecturer");
const Department = require("../models/Department");
const { get: cacheGet, set: cacheSet, clearByPrefix: cacheClearLecturers } = require("../utils/listCache");
const LECTURER_CACHE_PREFIX = "lecturers:";

// Utility function to generate slug from Hebrew/English text
const generateSlug = (text) => {
    return text
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0590-\u05FF\w-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
};

// Performance: find by slug without loading all lecturers. Try slug field first, then
// match name with regex (slug = name with spaces as hyphens) so one DB query.
const findLecturerBySlug = async (slug) => {
    // 1) If schema had slug field (e.g. after migration), one indexed lookup
    let lecturer = await Lecturer.findOne({ slug })
        .populate("createdBy", "fullName email")
        .populate("departments", "name code description")
        .lean();
    if (lecturer) return lecturer;

    // 2) Single query: match name where slug would equal generateSlug(name).
    // Regex: slug has hyphens; name has spaces. So match name that normalizes to this slug.
    const namePattern = slug.replace(/-/g, '[\\s-]+').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${namePattern}$`, 'i');
    lecturer = await Lecturer.findOne({ name: { $regex: regex } })
        .populate("createdBy", "fullName email")
        .populate("departments", "name code description")
        .lean();
    if (lecturer) return lecturer;

    // 3) Fallback: slug might be prefix (e.g. "john-1"). One more query by name prefix.
    const prefixPattern = slug.replace(/-/g, '[\\s-]+').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    lecturer = await Lecturer.findOne({ name: { $regex: new RegExp(`^${prefixPattern}`, 'i') } })
        .populate("createdBy", "fullName email")
        .populate("departments", "name code description")
        .lean();
    return lecturer || null;
};

// GET /api/lecturers (optional ?limit=; in-memory cache 2min, invalidated on write)
exports.getAllLecturers = async (req, res) => {
  try {
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit, 10) || 0, 2000) : 0;
    const cacheKey = `${LECTURER_CACHE_PREFIX}list:${limit}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.status(200).json(cached);
    const query = Lecturer.find()
      .populate("createdBy", "fullName email")
      .populate("departments", "name code description")
      .sort({ createdAt: -1 });
    const lecturers = limit > 0 ? await query.limit(limit).lean() : await query.lean();
    cacheSet(cacheKey, lecturers);
    res.status(200).json(lecturers);
  } catch (err) {
    res.status(500).json({
      message: "שגיאה בטעינת המרצים",
      error: err.message,
    });
  }
};

// GET /api/lecturers/:id
exports.getLecturerById = async (req, res) => {
  try {
    const lecturer = await Lecturer.findById(req.params.id)
      .populate("createdBy", "fullName email")
      .populate("departments", "name code description");

    if (!lecturer) {
      return res.status(404).json({ message: "מרצה לא נמצא" });
    }

    res.status(200).json(lecturer);
  } catch (err) {
    res.status(500).json({
      message: "שגיאה בטעינת המרצה",
      error: err.message,
    });
  }
};

// GET /api/lecturers/by-slug/:slug
exports.getLecturerBySlug = async (req, res) => {
  try {
    const rawSlug = req.params.slug;
    let slug = rawSlug;
    if (typeof rawSlug === "string") {
      try {
        slug = decodeURIComponent(rawSlug);
      } catch {
        slug = rawSlug;
      }
    }
    const lecturer = await findLecturerBySlug(slug);

    if (!lecturer) {
      return res.status(404).json({ message: "מרצה לא נמצא" });
    }

    res.status(200).json(lecturer);
  } catch (err) {
    console.error("Error fetching lecturer by slug:", err);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};

// POST /api/lecturers
exports.createLecturer = async (req, res) => {
  try {
    const { name, email, department, departments, phone, officeHours, specialization } = req.body;

    // Check if lecturer with this email already exists (only if email is provided)
    if (email && email.trim() !== "") {
      const existingLecturer = await Lecturer.findOne({ email });
      if (existingLecturer) {
        return res
          .status(400)
          .json({ message: "מרצה עם אימייל זה כבר קיים במערכת" });
      }
    }

    // Handle departments - support both new (departments array) and old (department string) formats
    let lecturerData = {
      name,
      email,
      phone,
      officeHours,
      specialization,
      createdBy: req.user._id,
    };

    // If departments array is provided (new format)
    if (departments && Array.isArray(departments) && departments.length > 0) {
      // Validate that all department IDs exist
      const existingDepartments = await Department.find({ _id: { $in: departments } });
      if (existingDepartments.length !== departments.length) {
        return res.status(400).json({ message: "אחת או יותר מהמחלקות שנבחרו לא קיימות" });
      }
      lecturerData.departments = departments;
    } 
    // If department string is provided (old format for backward compatibility)
    else if (department && department.trim() !== "") {
      lecturerData.department = department;
    } 
    // Neither provided
    else {
      return res.status(400).json({ message: "יש לבחור לפחות מחלקה אחת" });
    }

    const newLecturer = new Lecturer(lecturerData);
    await newLecturer.save();
    
    await newLecturer.populate("createdBy", "fullName email");
    await newLecturer.populate("departments", "name code description");

    cacheClearLecturers(LECTURER_CACHE_PREFIX);
    res.status(201).json({
      message: "מרצה נוצר בהצלחה",
      lecturer: newLecturer,
    });
  } catch (err) {
    console.error("Error creating lecturer:", err);
    if (err.code === 11000) {
      return res.status(400).json({
        message: "מרצה עם אימייל זה כבר קיים במערכת",
      });
    }
    res.status(500).json({
      message: "שגיאה ביצירת המרצה",
      error: err.message,
    });
  }
};

// PUT /api/lecturers/:id
exports.updateLecturer = async (req, res) => {
  try {
    const lecturer = await Lecturer.findById(req.params.id);

    if (!lecturer) {
      return res.status(404).json({ message: "מרצה לא נמצא" });
    }

    // Check if user has permission to update (creator or admin)
    if (
      lecturer.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "אין הרשאה לעדכן מרצה זה" });
    }

    const { name, email, department, departments, phone, officeHours, specialization } = req.body;

    // Prepare update data
    let updateData = { name, email, phone, officeHours, specialization };

    // Handle departments update - support both new and old formats
    if (departments && Array.isArray(departments)) {
      if (departments.length === 0) {
        return res.status(400).json({ message: "יש לבחור לפחות מחלקה אחת" });
      }
      
      // Validate that all department IDs exist
      const existingDepartments = await Department.find({ _id: { $in: departments } });
      if (existingDepartments.length !== departments.length) {
        return res.status(400).json({ message: "אחת או יותר מהמחלקות שנבחרו לא קיימות" });
      }
      
      updateData.departments = departments;
      updateData.department = undefined; // Clear old format when using new format
    } else if (department !== undefined) {
      updateData.department = department;
      // Don't clear departments array for backward compatibility
    }

    // Check email uniqueness (only if email is being changed and is not empty)
    if (email && email.trim() !== "" && email !== lecturer.email) {
      const existingLecturer = await Lecturer.findOne({ email, _id: { $ne: req.params.id } });
      if (existingLecturer) {
        return res.status(400).json({
          message: "מרצה אחר עם אימייל זה כבר קיים במערכת",
        });
      }
    }

    const updatedLecturer = await Lecturer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "fullName email")
      .populate("departments", "name code description");

    cacheClearLecturers(LECTURER_CACHE_PREFIX);
    res.status(200).json({
      message: "מרצה עודכן בהצלחה",
      lecturer: updatedLecturer,
    });
  } catch (err) {
    console.error("Error updating lecturer:", err);
    if (err.code === 11000) {
      return res.status(400).json({
        message: "מרצה עם אימייל זה כבר קיים במערכת",
      });
    }
    res.status(500).json({
      message: "שגיאה בעדכון המרצה",
      error: err.message,
    });
  }
};

// DELETE /api/lecturers/:id
exports.deleteLecturer = async (req, res) => {
  try {
    const lecturer = await Lecturer.findById(req.params.id);

    if (!lecturer) {
      return res.status(404).json({ message: "מרצה לא נמצא" });
    }

    // Check if user has permission to delete (creator or admin)
    if (
      lecturer.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "אין הרשאה למחוק מרצה זה" });
    }

    await Lecturer.findByIdAndDelete(req.params.id);
    cacheClearLecturers(LECTURER_CACHE_PREFIX);
    res.status(200).json({ message: "מרצה נמחק בהצלחה" });
  } catch (err) {
    res.status(500).json({
      message: "שגיאה במחיקת המרצה",
      error: err.message,
    });
  }
};

// GET /api/lecturers/search/:query
exports.searchLecturers = async (req, res) => {
  try {
    const { query } = req.params;

    const lecturers = await Lecturer.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { department: { $regex: query, $options: "i" } },
        { specialization: { $regex: query, $options: "i" } },
      ],
    })
      .populate("createdBy", "fullName email")
      .populate("departments", "name code description")
      .sort({ createdAt: -1 });

    res.status(200).json(lecturers);
  } catch (err) {
    res.status(500).json({
      message: "שגיאה בחיפוש מרצים",
      error: err.message,
    });
  }
};

// GET /api/lecturers/:id/full
exports.getLecturerWithCourses = async (req, res) => {
  try {
    const lecturer = await Lecturer.findById(req.params.id)
      .populate("createdBy", "fullName email")
      .populate("departments", "name code description")
      .populate("courses");

    if (!lecturer) {
      return res.status(404).json({ message: "מרצה לא נמצא" });
    }

    res.status(200).json(lecturer);
  } catch (err) {
    res.status(500).json({
      message: "שגיאה בטעינת המרצה עם הקורסים שלו",
      error: err.message,
    });
  }
};

// Get lecturers by department - new function
exports.getLecturersByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    // Search in both new departments array and old department string (by name)
    const department = await Department.findById(departmentId);
    let lecturers;
    
    if (department) {
      lecturers = await Lecturer.find({
        $or: [
          { departments: departmentId },
          { department: department.name }
        ]
      })
        .populate("createdBy", "fullName email")
        .populate("departments", "name code description")
        .sort({ name: 1 });
    } else {
      lecturers = [];
    }
    
    res.json(lecturers);
  } catch (err) {
    console.error("Error fetching lecturers by department:", err);
    res.status(500).json({ message: "שגיאה בטעינת מרצי המחלקה" });
  }
};