const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const { validate } = require("../middleware/validate");

// Public routes — body validation rejects malformed payloads before DB hits.
router.post(
  "/signup",
  validate({
    fullName: { type: "string", required: true, minLength: 2, maxLength: 100 },
    email: { type: "string", required: true, maxLength: 200 },
    password: { type: "string", required: true, minLength: 6, maxLength: 100 },
  }),
  authController.signup
);
router.post(
  "/login",
  validate({
    email: { type: "string", required: true },
    password: { type: "string", required: true },
  }),
  authController.login
);
router.post(
  "/forgot-password",
  validate({ email: { type: "string", required: true } }),
  authController.forgotPassword
);

// Protected routes
router.post(
  "/reset-password",
  protect,
  validate({
    currentPassword: { type: "string", required: true },
    newPassword: { type: "string", required: true, minLength: 6 },
  }),
  authController.resetPassword
);

// Admin routes (protected)
router.get("/users", protect, admin, authController.getAllUsers);
router.put("/promote/:userId", protect, admin, authController.promoteToAdmin);

module.exports = router;