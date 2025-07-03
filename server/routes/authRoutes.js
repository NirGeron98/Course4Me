const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);

// Protected routes
router.post("/reset-password", protect, authController.resetPassword);

// Admin routes (protected)
router.get("/users", protect, admin, authController.getAllUsers);
router.put("/promote/:userId", protect, admin, authController.promoteToAdmin);

module.exports = router;