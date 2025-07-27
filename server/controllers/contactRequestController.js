const ContactRequest = require("../models/ContactRequest");

// Get all contact requests (admin only)
exports.getAllContactRequests = async (req, res) => {
  try {
    const { status, startDate, endDate, search } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Text search in description or adminResponse
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: "i" } },
        { adminResponse: { $regex: search, $options: "i" } }
      ];
    }
    
    const requests = await ContactRequest.find(query)
      .populate("user", "fullName email")
      .populate("respondedBy", "fullName")
      .sort({ createdAt: -1 });
    
    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching contact requests:", err);
    res.status(500).json({ message: "שגיאה בטעינת הפניות" });
  }
};

// Get user's contact requests
exports.getUserContactRequests = async (req, res) => {
  try {
    const { status, startDate, endDate, search } = req.query;
    
    let query = { user: req.user._id };
    
    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Text search in description or adminResponse
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: "i" } },
        { adminResponse: { $regex: search, $options: "i" } }
      ];
    }
    
    const requests = await ContactRequest.find(query)
      .populate("respondedBy", "fullName")
      .sort({ createdAt: -1 });
    
    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching user contact requests:", err);
    res.status(500).json({ message: "שגיאה בטעינת הפניות שלך" });
  }
};

// Create new contact request
exports.createContactRequest = async (req, res) => {
  try {
    const { subject, description } = req.body;
    
    // Validate required fields
    if (!subject || !description) {
      return res.status(400).json({ message: "נושא ותיאור הם שדות חובה" });
    }
    
    // Validate subject enum
    const validSubjects = ["add_lecturer_to_course", "add_course_to_lecturer", "add_course_to_system", "add_lecturer_to_system", "general_inquiry"];
    if (!validSubjects.includes(subject)) {
      return res.status(400).json({ message: "נושא לא חוקי" });
    }
    
    const contactRequest = new ContactRequest({
      user: req.user._id,
      subject,
      description: description.trim(),
    });
    
    const savedRequest = await contactRequest.save();
    
    // Populate user data for response
    await savedRequest.populate("user", "fullName email");
    
    res.status(201).json(savedRequest);
  } catch (err) {
    console.error("Error creating contact request:", err);
    res.status(500).json({ message: "שגיאה ביצירת הפנייה" });
  }
};

// Update contact request (admin only)
exports.updateContactRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;
    
    // Validate status
    const validStatuses = ["pending", "in_progress", "answered"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "סטטוס לא חוקי" });
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (adminResponse !== undefined) updateData.adminResponse = adminResponse.trim();
    
    // If providing a response, update responded info
    if (adminResponse !== undefined) {
      updateData.respondedBy = req.user._id;
      updateData.respondedAt = new Date();
    }
    
    const updatedRequest = await ContactRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("user", "fullName email")
      .populate("respondedBy", "fullName");
    
    if (!updatedRequest) {
      return res.status(404).json({ message: "פנייה לא נמצאה" });
    }
    
    res.status(200).json(updatedRequest);
  } catch (err) {
    console.error("Error updating contact request:", err);
    res.status(500).json({ message: "שגיאה בעדכון הפנייה" });
  }
};

// Delete contact request (admin only)
exports.deleteContactRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRequest = await ContactRequest.findByIdAndDelete(id);
    
    if (!deletedRequest) {
      return res.status(404).json({ message: "פנייה לא נמצאה" });
    }
    
    res.status(200).json({ message: "הפנייה נמחקה בהצלחה" });
  } catch (err) {
    console.error("Error deleting contact request:", err);
    res.status(500).json({ message: "שגיאה במחיקת הפנייה" });
  }
};

// Update user's own contact request
exports.updateUserContactRequest = async (req, res) => {
  try {
    console.log('=== Update Contact Request ===');
    console.log('Request ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('User ID:', req.user._id);
    
    const { id } = req.params;
    const { subject, description } = req.body;
    const userId = req.user._id;
    
    // Validate subject if provided
    if (subject) {
      const validSubjects = ["add_lecturer_to_course", "add_course_to_lecturer", "add_course_to_system", "add_lecturer_to_system", "general_inquiry"];
      if (!validSubjects.includes(subject)) {
        return res.status(400).json({ message: "נושא לא חוקי" });
      }
    }
    
    // Find the request and check if it belongs to the user
    const existingRequest = await ContactRequest.findById(id);
    
    if (!existingRequest) {
      return res.status(404).json({ message: "פנייה לא נמצאה" });
    }
    
    // Check if user owns this request
    if (existingRequest.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "אין לך הרשאה לערוך פנייה זו" });
    }
    
    // Don't allow editing if request has been answered
    if (existingRequest.status === "answered") {
      return res.status(400).json({ message: "לא ניתן לערוך פנייה שכבר נענתה" });
    }
    
    const updateData = {};
    if (subject) updateData.subject = subject;
    if (description) updateData.description = description.trim();
    updateData.updatedAt = new Date();

    const updatedRequest = await ContactRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("user", "fullName email")
      .populate("respondedBy", "fullName");

    console.log('Updated request:', updatedRequest);
    res.status(200).json(updatedRequest);
  } catch (err) {
    console.error("Error updating user contact request:", err);
    res.status(500).json({ message: "שגיאה בעדכון הפנייה" });
  }
};

// Delete user's own contact request
exports.deleteUserContactRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find the request and check if it belongs to the user
    const existingRequest = await ContactRequest.findById(id);
    
    if (!existingRequest) {
      return res.status(404).json({ message: "פנייה לא נמצאה" });
    }
    
    // Check if user owns this request
    if (existingRequest.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "אין לך הרשאה למחוק פנייה זו" });
    }
    
    // Don't allow deleting if request has been answered
    if (existingRequest.status === "answered") {
      return res.status(400).json({ message: "לא ניתן למחוק פנייה שכבר נענתה" });
    }
    
    await ContactRequest.findByIdAndDelete(id);
    
    res.status(200).json({ message: "הפנייה נמחקה בהצלחה" });
  } catch (err) {
    console.error("Error deleting user contact request:", err);
    res.status(500).json({ message: "שגיאה במחיקת הפנייה" });
  }
};

// Update admin response (admin only)
exports.updateAdminResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse } = req.body;
    
    const existingRequest = await ContactRequest.findById(id);
    
    if (!existingRequest) {
      return res.status(404).json({ message: "פנייה לא נמצאה" });
    }
    
    // Check if the admin is the one who originally responded or if there's no response yet
    if (existingRequest.respondedBy && existingRequest.respondedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "רק האדמין שהגיב יכול לערוך את התגובה" });
    }
    
    const updateData = {
      adminResponse: adminResponse.trim(),
      respondedBy: req.user._id,
      respondedAt: new Date()
    };
    
    const updatedRequest = await ContactRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("user", "fullName email")
      .populate("respondedBy", "fullName");
    
    res.status(200).json(updatedRequest);
  } catch (err) {
    console.error("Error updating admin response:", err);
    res.status(500).json({ message: "שגיאה בעדכון התגובה" });
  }
};

// Delete admin response (admin only)
exports.deleteAdminResponse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingRequest = await ContactRequest.findById(id);
    
    if (!existingRequest) {
      return res.status(404).json({ message: "פנייה לא נמצאה" });
    }
    
    // Check if the admin is the one who originally responded
    if (existingRequest.respondedBy && existingRequest.respondedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "רק האדמין שהגיב יכול למחוק את התגובה" });
    }
    
    const updateData = {
      adminResponse: "",
      respondedBy: null,
      respondedAt: null,
      status: "pending"
    };
    
    const updatedRequest = await ContactRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("user", "fullName email")
      .populate("respondedBy", "fullName");
    
    res.status(200).json(updatedRequest);
  } catch (err) {
    console.error("Error deleting admin response:", err);
    res.status(500).json({ message: "שגיאה במחיקת התגובה" });
  }
};