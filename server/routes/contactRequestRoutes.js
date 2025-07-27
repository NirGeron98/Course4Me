const express = require("express");
const router = express.Router();
const contactRequestController = require("../controllers/contactRequestController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Protected routes (require authentication)
router.use(protect);

// User routes
router.get("/my-requests", contactRequestController.getUserContactRequests);
router.post("/", contactRequestController.createContactRequest);
router.put("/my-requests/:id", contactRequestController.updateUserContactRequest);
router.delete("/my-requests/:id", contactRequestController.deleteUserContactRequest);

// Admin routes
router.get("/", admin, contactRequestController.getAllContactRequests);
router.put("/:id", admin, contactRequestController.updateContactRequest);
router.delete("/:id", admin, contactRequestController.deleteContactRequest);
router.put("/:id/response", admin, contactRequestController.updateAdminResponse);
router.delete("/:id/response", admin, contactRequestController.deleteAdminResponse);

module.exports = router;