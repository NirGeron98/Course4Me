const ContactRequest = require("../models/ContactRequest");
const User = require("../models/User");

// Create a new contact request
exports.createContactRequest = async (req, res) => {
  try {
    const { type, subject, message } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!type || !subject || !message) {
      return res.status(400).json({ error: "כל השדות נדרשים" });
    }

    // Validate type
    if (!["course_request", "lecturer_request", "general_request"].includes(type)) {
      return res.status(400).json({ error: "סוג הפניה לא תקין" });
    }

    // Create new contact request
    const contactRequest = new ContactRequest({
      user: userId,
      type,
      subject,
      message
    });

    await contactRequest.save();

    // Populate user info for response
    await contactRequest.populate("user", "fullName email");

    res.status(201).json({
      message: "הפניה נשלחה בהצלחה",
      contactRequest
    });
  } catch (error) {
    console.error("Error creating contact request:", error);
    res.status(500).json({ error: "שגיאה בשליחת הפניה" });
  }
};

// Get all contact requests (admin only)
exports.getAllContactRequests = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const type = req.query.type;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (page - 1) * limit;

    const contactRequests = await ContactRequest.find(filter)
      .populate("user", "fullName email")
      .populate("adminUser", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ContactRequest.countDocuments(filter);

    res.json({
      contactRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching contact requests:", error);
    res.status(500).json({ error: "שגיאה בטעינת הפניות" });
  }
};

// Get user's contact requests
exports.getUserContactRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const contactRequests = await ContactRequest.find({ user: userId })
      .populate("adminUser", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ContactRequest.countDocuments({ user: userId });

    res.json({
      contactRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching user contact requests:", error);
    res.status(500).json({ error: "שגיאה בטעינת הפניות" });
  }
};

// Update contact request status (admin only)
exports.updateContactRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;
    const adminUserId = req.user.id;

    // Validate status
    if (!["pending", "in_progress", "resolved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "סטטוס לא תקין" });
    }

    const contactRequest = await ContactRequest.findById(id);
    if (!contactRequest) {
      return res.status(404).json({ error: "הפניה לא נמצאה" });
    }

    // Update the contact request
    contactRequest.status = status;
    if (adminResponse) {
      contactRequest.adminResponse = adminResponse;
    }
    contactRequest.adminUser = adminUserId;

    await contactRequest.save();

    // Populate for response
    await contactRequest.populate("user", "fullName email");
    await contactRequest.populate("adminUser", "fullName email");

    res.json({
      message: "הפניה עודכנה בהצלחה",
      contactRequest
    });
  } catch (error) {
    console.error("Error updating contact request:", error);
    res.status(500).json({ error: "שגיאה בעדכון הפניה" });
  }
};

// Delete contact request (admin only)
exports.deleteContactRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const contactRequest = await ContactRequest.findById(id);
    if (!contactRequest) {
      return res.status(404).json({ error: "הפניה לא נמצאה" });
    }

    await ContactRequest.findByIdAndDelete(id);

    res.json({ message: "הפניה נמחקה בהצלחה" });
  } catch (error) {
    console.error("Error deleting contact request:", error);
    res.status(500).json({ error: "שגיאה במחיקת הפניה" });
  }
};

// Get contact request by ID
exports.getContactRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    const contactRequest = await ContactRequest.findById(id)
      .populate("user", "fullName email")
      .populate("adminUser", "fullName email");

    if (!contactRequest) {
      return res.status(404).json({ error: "הפניה לא נמצאה" });
    }

    // Check if user has permission to view this request
    if (!isAdmin && contactRequest.user._id.toString() !== userId) {
      return res.status(403).json({ error: "אין הרשאה לצפייה בפניה זו" });
    }

    res.json(contactRequest);
  } catch (error) {
    console.error("Error fetching contact request:", error);
    res.status(500).json({ error: "שגיאה בטעינת הפניה" });
  }
};
