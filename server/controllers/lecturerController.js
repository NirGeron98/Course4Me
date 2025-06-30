const Lecturer = require("../models/Lecturer");
const Department = require("../models/Department");

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

// Function to find lecturer by slug (with fallback logic)
const findLecturerBySlug = async (slug) => {
    // First try to find by exact slug match (if lecturer has slug field)
    let lecturer = await Lecturer.findOne({ slug })
        .populate("createdBy", "fullName email")
        .populate("departments", "name code description");
    
    if (lecturer) return lecturer;
    
    // If no exact match, try to find by generating slug from name
    const lecturers = await Lecturer.find()
        .populate("createdBy", "fullName email")
        .populate("departments", "name code description");
    
    for (let lec of lecturers) {
        const generatedSlug = generateSlug(lec.name);
        if (generatedSlug === slug || 
            slug.startsWith(`${generatedSlug}-`) ||
            `${generatedSlug}-1` === slug) {
            return lec;
        }
    }
    
    return null;
};

// GET /api/lecturers
exports.getAllLecturers = async (req, res) => {
  try {
    const lecturers = await Lecturer.find()
      .populate("createdBy", "fullName email")
      .populate("departments", "name code description")
      .sort({ createdAt: -1 });

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
    const lecturer = await findLecturerBySlug(req.params.slug);

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