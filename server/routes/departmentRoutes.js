const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const { addCacheHeaders } = require("../middleware/cacheMiddleware");

router.get("/", addCacheHeaders(300), departmentController.getAllDepartments);
router.post("/", protect, admin, departmentController.createDepartment);
router.put("/:id", protect, admin, departmentController.updateDepartment);
router.delete("/:id", protect, admin, departmentController.deleteDepartment);

module.exports = router;
