const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getCurrentUser
} = require("../controllers/userController");

// Existing route
router.get("/me", protect, getCurrentUser);

// New routes for profile management
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/password", protect, updateUserPassword);

module.exports = router;