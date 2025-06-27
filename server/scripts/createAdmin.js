const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

const createAdminUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@afeka.ac.il" });
    if (existingAdmin) {
      return;
    }

    // Create admin user
    const adminUser = new User({
      fullName: "מנהל מערכת",
      email: "admin@afeka.ac.il",
      password: "admin123456", // Will be hashed automatically by the User model
      role: "admin"
    });

    await adminUser.save();
 
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the script
if (require.main === module) {
  createAdminUser();
}

module.exports = createAdminUser;