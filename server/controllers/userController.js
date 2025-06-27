const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format response to match frontend expectations
    const userProfile = {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      academicInstitution: user.academicInstitution || "מכללת אפקה"
    };

    res.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { fullName, email, academicInstitution } = req.body;
    
    // Validate input
    if (!fullName || !email) {
      return res.status(400).json({ message: "נדרש להזין שם מלא ואימייל" });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: req.user.id }
    });

    if (existingUser) {
      return res.status(400).json({ message: "אימייל כבר קיים במערכת" });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        academicInstitution: academicInstitution?.trim()
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format response
    const userProfile = {
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      academicInstitution: updatedUser.academicInstitution || "מכללת אפקה"
    };

    res.json(userProfile);
  } catch (error) {
    console.error("Error updating user profile:", error);
    
    if (error.name === "ValidationError") {
      return res.status(400).json({ 
        message: "Validation error",
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// Update user password
const updateUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "נדרש להזין סיסמה נוכחית וסיסמה חדשה" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "הסיסמה החדשה חייבת להכיל 6 תווים לפחות" });
    }

    // Get user with password
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isCurrentPasswordCorrect = await user.correctPassword(currentPassword);
    
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({ message: "הסיסמה הנוכחית אינה נכונה" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "סיסמה עודכנה בהצלחה" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "שגיאת שרת" });
  }
};

// Get current user (for /me endpoint)
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getCurrentUser
};