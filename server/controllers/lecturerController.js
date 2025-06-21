const Lecturer = require("../models/Lecturer");

// GET /api/lecturers
exports.getAllLecturers = async (req, res) => {
  try {
    const lecturers = await Lecturer.find()
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json(lecturers);
  } catch (err) {
    res.status(500).json({ 
      message: "שגיאה בטעינת המרצים", 
      error: err.message 
    });
  }
};

// GET /api/lecturers/:id
exports.getLecturerById = async (req, res) => {
  try {
    const lecturer = await Lecturer.findById(req.params.id)
      .populate("createdBy", "fullName email");

    if (!lecturer) {
      return res.status(404).json({ message: "מרצה לא נמצא" });
    }

    res.status(200).json(lecturer);
  } catch (err) {
    res.status(500).json({ 
      message: "שגיאה בטעינת המרצה", 
      error: err.message 
    });
  }
};

// POST /api/lecturers
exports.createLecturer = async (req, res) => {
  try {
    const { name, email, department, phone, officeHours, specialization } = req.body;

    // Check if lecturer with this email already exists
    const existingLecturer = await Lecturer.findOne({ email });
    if (existingLecturer) {
      return res.status(400).json({ 
        message: "מרצה עם אימייל זה כבר קיים במערכת" 
      });
    }

    const newLecturer = new Lecturer({
      name,
      email,
      department,
      phone,
      officeHours,
      specialization,
      createdBy: req.user._id,
    });

    await newLecturer.save();
    await newLecturer.populate("createdBy", "fullName email");

    res.status(201).json({
      message: "מרצה נוצר בהצלחה",
      lecturer: newLecturer,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "מרצה עם אימייל זה כבר קיים במערכת" 
      });
    }
    res.status(500).json({ 
      message: "שגיאה ביצירת המרצה", 
      error: err.message 
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

    const updatedLecturer = await Lecturer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("createdBy", "fullName email");

    res.status(200).json({
      message: "מרצה עודכן בהצלחה",
      lecturer: updatedLecturer,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "מרצה עם אימייל זה כבר קיים במערכת" 
      });
    }
    res.status(500).json({ 
      message: "שגיאה בעדכון המרצה", 
      error: err.message 
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
      error: err.message 
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
      .sort({ createdAt: -1 });

    res.status(200).json(lecturers);
  } catch (err) {
    res.status(500).json({ 
      message: "שגיאה בחיפוש מרצים", 
      error: err.message 
    });
  }
};