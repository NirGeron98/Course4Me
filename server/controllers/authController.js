const jwt = require("jsonwebtoken");
const User = require("../models/User");
const emailService = require("../services/emailService");
const { generateTempPassword, getTempPasswordExpiration, isExpired } = require("../utils/passwordUtils");
const bcrypt = require("bcryptjs");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "משתמש עם אימייל זה כבר קיים במערכת" });
    }

    const newUser = await User.create({ fullName, email, password });
    const token = createToken(newUser._id);

    res.status(201).json({
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת פנימית, נסה שוב מאוחר יותר" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "אימייל או סיסמה שגויים" });
    }

    // Check if using temporary password
    let isValidPassword = false;
    let usingTempPassword = false;

    // First check regular password
    if (await user.correctPassword(password)) {
      isValidPassword = true;
    }
    // Then check temporary password if regular password failed
    else if (user.tempPassword && user.tempPasswordExpires) {
      
      if (isExpired(user.tempPasswordExpires)) {
        // Temporary password expired, clear it
        await User.findByIdAndUpdate(user._id, {
          $unset: { tempPassword: 1, tempPasswordExpires: 1 },
          isUsingTempPassword: false
        });
        return res.status(401).json({ message: "הסיסמה הזמנית פגה, אנא בקש סיסמה חדשה" });
      }

      // Check if temporary password matches
      const tempPasswordMatch = await bcrypt.compare(password, user.tempPassword);
      
      if (tempPasswordMatch) {
        isValidPassword = true;
        usingTempPassword = true;
        
        // Mark user as using temp password
        await User.findByIdAndUpdate(user._id, {
          isUsingTempPassword: true
        });
      }
    }

    if (!isValidPassword) {
      return res.status(401).json({ message: "אימייל או סיסמה שגויים" });
    }

    const token = createToken(user._id);

    const response = {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
      requiresPasswordReset: usingTempPassword
    };
    
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת פנימית, נסה שוב מאוחר יותר" });
  }
};

// Forgot Password - Send temporary password via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "נדרשת כתובת אימייל" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        message: "אם כתובת האימייל קיימת במערכת, תישלח אליה סיסמה זמנית" 
      });
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const hashedTempPassword = await bcrypt.hash(tempPassword, 12);
    const tempPasswordExpires = getTempPasswordExpiration();

    // Update user with temporary password
    await User.findByIdAndUpdate(user._id, {
      tempPassword: hashedTempPassword,
      tempPasswordExpires: tempPasswordExpires,
      isUsingTempPassword: true
    });

    // Send email with temporary password
    const emailResult = await emailService.sendTemporaryPassword(
      user.email,
      user.fullName,
      tempPassword
    );

    if (!emailResult.success) {
      return res.status(500).json({ 
        message: "שגיאה בשליחת האימייל, נסה שוב מאוחר יותר" 
      });
    }

    res.status(200).json({
      message: "סיסמה זמנית נשלחה לכתובת האימייל שלך"
    });

  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת פנימית, נסה שוב מאוחר יותר" });
  }
};

// Reset Password - Change temporary password to permanent one
exports.resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "נדרשת סיסמה נוכחית וסיסמה חדשה" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "הסיסמה החדשה חייבת להכיל לפחות 6 תווים" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "משתמש לא נמצא" });
    }

    // Verify current password (could be temporary or regular)
    let isValidCurrentPassword = false;
    
    
    if (user.tempPassword && user.tempPasswordExpires) {
      if (isExpired(user.tempPasswordExpires)) {
        return res.status(401).json({ message: "הסיסמה הזמנית פגה" });
      }
      
      const tempPasswordMatch = await bcrypt.compare(currentPassword, user.tempPassword);
      
      if (tempPasswordMatch) {
        isValidCurrentPassword = true;
      }
    }
    
    if (!isValidCurrentPassword) {
      const regularPasswordMatch = await user.correctPassword(currentPassword);
      
      if (regularPasswordMatch) {
        isValidCurrentPassword = true;
      }
    }
    
    if (!isValidCurrentPassword) {
      return res.status(401).json({ message: "הסיסמה הנוכחית שגויה" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update user with new password and clear temporary password
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      $unset: { tempPassword: 1, tempPasswordExpires: 1 },
      isUsingTempPassword: false
    });

    res.status(200).json({
      message: "הסיסמה שונתה בהצלחה"
    });

  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת פנימית, נסה שוב מאוחר יותר" });
  }
};

// Optional: Add route to promote user to admin (for development/testing)
exports.promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Only allow if the requesting user is already an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "רק מנהל יכול לקדם משתמשים" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: "admin" },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "משתמש לא נמצא" });
    }

    res.status(200).json({
      message: "המשתמש קודם למנהל בהצלחה",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "רק מנהל יכול לצפות ברשימת המשתמשים" });
    }

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};