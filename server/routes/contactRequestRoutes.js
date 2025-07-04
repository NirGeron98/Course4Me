const express = require("express");
const router = express.Router();
const contactRequestController = require("../controllers/contactRequestController");
const { protect: authMiddleware } = require("../middleware/authMiddleware");
const { admin: adminMiddleware } = require("../middleware/adminMiddleware");

// Create a new contact request (authenticated users only)
router.post("/", authMiddleware, contactRequestController.createContactRequest);

// Get user's contact requests (authenticated users only)
router.get("/my-requests", authMiddleware, contactRequestController.getUserContactRequests);

// Get all contact requests (admin only)
router.get("/", authMiddleware, adminMiddleware, contactRequestController.getAllContactRequests);

// Get contact request by ID (admin or request owner only)
router.get("/:id", authMiddleware, contactRequestController.getContactRequestById);

// Update contact request status (admin only)
router.put("/:id/status", authMiddleware, adminMiddleware, contactRequestController.updateContactRequestStatus);

// Delete contact request (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, contactRequestController.deleteContactRequest);

module.exports = router;
