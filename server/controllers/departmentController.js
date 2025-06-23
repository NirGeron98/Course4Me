const Department = require("../models/Department");

exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    const existing = await Department.findOne({ $or: [{ name }, { code }] });
    if (existing) {
      return res.status(400).json({ message: "Department already exists" });
    }

    const department = new Department({ name, code, description });
    const saved = await department.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Failed to create department", error: err.message });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch departments" });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const updated = await Department.findByIdAndUpdate(
      id,
      { name, code, description },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update department" });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await Department.findByIdAndDelete(id);
    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete department" });
  }
};
