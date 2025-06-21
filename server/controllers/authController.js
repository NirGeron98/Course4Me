const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
    console.error("Signup error:", err);
    res.status(500).json({ message: "שגיאת שרת פנימית, נסה שוב מאוחר יותר" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({ message: "אימייל או סיסמה שגויים" });
    }

    const token = createToken(user._id);

    res.status(200).json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
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
    console.error("Promote user error:", err);
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
    console.error("Get users error:", err);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};