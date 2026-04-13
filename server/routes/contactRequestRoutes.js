const express = require("express");
const router = express.Router();
const contactRequestController = require("../controllers/contactRequestController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const { validate } = require("../middleware/validate");

const SUBJECTS = [
  "add_lecturer_to_course",
  "add_course_to_lecturer",
  "add_course_to_system",
  "add_lecturer_to_system",
  "general_inquiry",
];
const STATUSES = ["pending", "in_progress", "answered"];

const createSchema = {
  subject: { type: "string", required: true, enum: SUBJECTS },
  description: { type: "string", required: true, minLength: 1, maxLength: 5000 },
};
const userUpdateSchema = {
  subject: { type: "string", enum: SUBJECTS },
  description: { type: "string", minLength: 1, maxLength: 5000 },
};
const adminUpdateSchema = {
  status: { type: "string", enum: STATUSES },
  adminResponse: { type: "string", maxLength: 5000 },
};
const adminResponseSchema = {
  adminResponse: { type: "string", required: true, minLength: 1, maxLength: 5000 },
};

// Protected routes (require authentication)
router.use(protect);

// User routes
router.get("/my-requests", contactRequestController.getUserContactRequests);
router.post("/", validate(createSchema), contactRequestController.createContactRequest);
router.put(
  "/my-requests/:id",
  validate(userUpdateSchema),
  contactRequestController.updateUserContactRequest
);
router.delete("/my-requests/:id", contactRequestController.deleteUserContactRequest);

// Admin routes
router.get("/", admin, contactRequestController.getAllContactRequests);
router.put("/:id", admin, validate(adminUpdateSchema), contactRequestController.updateContactRequest);
router.delete("/:id", admin, contactRequestController.deleteContactRequest);
router.put(
  "/:id/response",
  admin,
  validate(adminResponseSchema),
  contactRequestController.updateAdminResponse
);
router.delete("/:id/response", admin, contactRequestController.deleteAdminResponse);

module.exports = router;