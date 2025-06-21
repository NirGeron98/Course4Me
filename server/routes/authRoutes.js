const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Admin routes (protected)
router.get("/users", protect, admin, authController.getAllUsers);
router.put("/promote/:userId", protect, admin, authController.promoteToAdmin);

module.exports = router;